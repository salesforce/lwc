/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    setPrototypeOf,
    isUndefined,
    defineProperties,
    isObject,
    isFunction,
    StringToLowerCase,
} from '@lwc/shared';
import { hasCustomElements } from './has-custom-elements';

export type CreateScopedConstructor = (
    tagName: string,
    UserCtor: CustomElementConstructor
) => CustomElementConstructor;

/**
 * Create a scoped registry, i.e. a function that can create custom elements whose tag names
 * do not conflict with vanilla custom elements having the same tag name.
 */
export function createScopedRegistry(): CreateScopedConstructor {
    if (!hasCustomElements) {
        // This code should never be reached, because we don't use the pivot registry if
        // custom elements are unavailable.
        throw new Error('Custom elements are not supported in this environment.');
    }

    const { HTMLElement: NativeHTMLElement } = window;
    const {
        hasAttribute: nativeHasAttribute,
        setAttribute: nativeSetAttribute,
        removeAttribute: nativeRemoveAttribute,
        getAttribute: nativeGetAttribute,
    } = NativeHTMLElement.prototype;

    const definitionForElement = new WeakMap<HTMLElement, Definition>();
    const pendingRegistryForElement = new WeakMap<HTMLElement, Definition>();
    const definitionForConstructor = new WeakMap<CustomElementConstructor, Definition>();
    const registeredUserCtors = new WeakSet<CustomElementConstructor>();

    const pivotCtorByTag = new Map<string, CustomElementConstructor>();
    const globalDefinitionsByTag = new Map<string, Definition>();
    const globalDefinitionsByClass = new Map<CustomElementConstructor, Definition>();
    const awaitingUpgrade = new Map<string, Set<HTMLElement>>();

    const EMPTY_SET: Set<string> = new Set();

    interface Definition {
        UserCtor: CustomElementConstructor;
        PivotCtor?: CustomElementConstructor;
        connectedCallback?: () => void;
        disconnectedCallback?: () => void;
        adoptedCallback?: () => void;
        attributeChangedCallback?: (name: string, oldValue: any, newValue: any) => void;
        observedAttributes: Set<string>;
    }

    function createDefinitionRecord(constructor: CustomElementConstructor): Definition {
        const {
            connectedCallback,
            disconnectedCallback,
            adoptedCallback,
            attributeChangedCallback,
        } = constructor.prototype;
        const observedAttributes = new Set(constructor.observedAttributes ?? []);
        return {
            UserCtor: constructor,
            PivotCtor: undefined,
            connectedCallback,
            disconnectedCallback,
            adoptedCallback,
            attributeChangedCallback,
            observedAttributes,
        };
    }

    // Helper to create stand-in element for each tagName registered that delegates out to the registry for the given
    // element. Note that the `registeredDefinition` represents the constructor that was used to register during
    // `customElements.define()`. Whereas the `pivotDefinition` represents the constructor that is passed when the pivot
    // constructor is invoked with another constructor.
    function createPivotingClass(
        tagName: string,
        registeredDefinition: Definition
    ): CustomElementConstructor {
        class PivotCtor extends NativeHTMLElement {
            constructor(UserCtor?: CustomElementConstructor) {
                // This constructor can only be invoked by:
                // a) the browser instantiating  an element from parsing or via document.createElement.
                // b) LWC new PivotClass (This constructor is NOT observable/accessible in user-land).
                // b) new UserClass.
                // When LWC instantiates it, it will pass the upgrading definition as an argument
                // If the caller signals via UserCtor that this is in fact a controlled
                // definition, we use that one, otherwise fallback to the global
                // internal registry.
                super();

                const userCtorIsDefined = !isUndefined(UserCtor);

                if (userCtorIsDefined) {
                    if (!isConstructor(UserCtor)) {
                        throw new TypeError(
                            `Failed to create custom element: the provided constructor is not a constructor.`
                        );
                    }
                    if (!registeredUserCtors.has(UserCtor)) {
                        throw new Error(
                            `Failed to create custom element: the provided constructor is unregistered: ${UserCtor.name}.`
                        );
                    }
                }

                const definition = userCtorIsDefined
                    ? getOrCreateDefinitionForConstructor(UserCtor)
                    : globalDefinitionsByTag.get(tagName);
                if (!isUndefined(definition)) {
                    internalUpgrade(this, registeredDefinition, definition);
                } else {
                    // This is the case in which there is no global definition, and
                    // it is not handled by LWC (otherwise it will have a valid UserCtor)
                    // so we need to add it to the pending queue just in case it eventually
                    // gets defined in the global registry.
                    pendingRegistryForElement.set(this, registeredDefinition);
                }
            }

            connectedCallback(this: HTMLElement) {
                const definition = definitionForElement.get(this);
                if (!isUndefined(definition)) {
                    // Delegate out to user callback
                    definition.connectedCallback?.call(this);
                } else {
                    // Register for upgrade when defined (only when connected, so we don't leak)
                    let awaiting = awaitingUpgrade.get(tagName);
                    if (isUndefined(awaiting)) {
                        awaitingUpgrade.set(tagName, (awaiting = new Set()));
                    }
                    awaiting.add(this);
                }
            }

            disconnectedCallback(this: HTMLElement) {
                const definition = definitionForElement.get(this);
                if (!isUndefined(definition)) {
                    // Delegate out to user callback
                    definition.disconnectedCallback?.call(this);
                } else {
                    // Un-register for upgrade when defined (so we don't leak)
                    const awaiting = awaitingUpgrade.get(tagName);
                    // At this point, awaiting should never be undefined, because connectedCallback
                    // must have been called before disconnectedCallback. But just to be safe, we check
                    if (!isUndefined(awaiting)) {
                        awaiting.delete(this);
                    }
                }
            }

            adoptedCallback(this: HTMLElement) {
                const definition = definitionForElement.get(this);
                definition?.adoptedCallback?.call(this);
            }

            attributeChangedCallback(
                this: HTMLElement,
                name: string,
                oldValue: any,
                newValue: any
            ) {
                const definition = definitionForElement.get(this);
                // if both definitions are the same, then the observedAttributes is the same,
                // but if they are different, only if the runtime definition has the attribute
                // marked as observed, then it should invoke attributeChangedCallback.
                if (
                    registeredDefinition === definition ||
                    definition?.observedAttributes.has(name)
                ) {
                    definition.attributeChangedCallback?.apply(this, [name, oldValue, newValue]);
                }
            }

            static observedAttributes = [...registeredDefinition.observedAttributes];
        }

        return PivotCtor;
    }

    function getNewObservedAttributes(
        registeredDefinition: Definition,
        pivotDefinition: Definition
    ): Set<string> {
        const { observedAttributes, attributeChangedCallback } = pivotDefinition;
        if (observedAttributes.size === 0 || isUndefined(attributeChangedCallback)) {
            // This instance does not need to observe any attributes, no need to patch
            return EMPTY_SET;
        }

        // Natively, the attributes observed by the registered definition are going to be taken
        // care of by the browser, only the difference between the two sets has to be taken
        // care by the patched version.
        return new Set(
            [...pivotDefinition.observedAttributes].filter(
                (x) => !registeredDefinition.observedAttributes.has(x)
            )
        );
    }

    function throwAsyncError(error: unknown): void {
        // Per native custom element behavior, errors thrown in attributeChangedCallback
        // become unhandled async errors. We use setTimeout() instead of Promise.resolve()
        // to make it an unhandled error rather than an unhandled rejection.
        setTimeout(() => {
            throw error;
        });
    }

    // Helper to patch `setAttribute`/`getAttribute` to implement `attributeChangedCallback`.
    // Why is this necessary? Well basically, you can't change the `observedAttributes` after
    // a custom element is defined. So with pivots, if two classes share the same tag name,
    // and the second class observes attributes that aren't observed by the first one,
    // then those attributes can never be observed by the native `observedAttributes` system.
    // So we have to simulate it by patching `getAttribute`/`removeAttribute`. Note that
    // we only do this when absolutely necessary, though; i.e. because we've determined
    // that we aren't observing the attributes we need to.
    function patchAttributes(
        instance: HTMLElement,
        registeredDefinition: Definition,
        pivotDefinition: Definition
    ) {
        const newObservedAttributes = getNewObservedAttributes(
            registeredDefinition,
            pivotDefinition
        );
        if (newObservedAttributes.size === 0) {
            return;
        }
        const { attributeChangedCallback } = pivotDefinition;

        // Patch the instance.
        // Note we use the native `getAttribute` rather than the super's `getAttribute` because
        // we don't actually want it to be observable that we're calling `getAttribute` from
        // `setAttribute` and `removeAttribute`.
        // TODO [#2994]: this should handle reflected properties such as `ariaLabel` and `role`.
        defineProperties(instance, {
            setAttribute: {
                value: function setAttribute(name: string, value: any) {
                    if (newObservedAttributes.has(name)) {
                        const old = nativeGetAttribute.call(this, name);
                        nativeSetAttribute.call(this, name, value);
                        try {
                            attributeChangedCallback!.call(this, name, old, value + '');
                        } catch (error) {
                            throwAsyncError(error);
                        }
                    } else {
                        nativeSetAttribute.call(this, name, value);
                    }
                },
                writable: true,
                enumerable: true,
                configurable: true,
            },
            removeAttribute: {
                value: function removeAttribute(name: string) {
                    if (newObservedAttributes.has(name)) {
                        const old = nativeGetAttribute.call(this, name);
                        nativeRemoveAttribute.call(this, name);
                        try {
                            attributeChangedCallback!.call(this, name, old, null);
                        } catch (error) {
                            throwAsyncError(error);
                        }
                    } else {
                        nativeRemoveAttribute.call(this, name);
                    }
                },
                writable: true,
                enumerable: true,
                configurable: true,
            },
        });
    }

    function patchAttributesDuringUpgrade(
        instance: HTMLElement,
        registeredDefinition: Definition,
        pivotDefinition: Definition
    ) {
        // The below case patches observed attributes for the case where the HTML element is upgraded
        // from a pre-existing one in the DOM.
        const newObservedAttributes = getNewObservedAttributes(
            registeredDefinition,
            pivotDefinition
        );
        if (getNewObservedAttributes(registeredDefinition, pivotDefinition).size === 0) {
            return;
        }
        const { attributeChangedCallback } = pivotDefinition;
        // Approximate observedAttributes from the user class, but only for the new observed attributes
        newObservedAttributes.forEach((name) => {
            if (nativeHasAttribute.call(instance, name)) {
                const newValue = nativeGetAttribute.call(instance, name);
                attributeChangedCallback!.call(instance, name, null, newValue);
            }
        });
    }

    // User extends this HTMLElement, which returns the CE being upgraded
    let upgradingInstance: HTMLElement | undefined;

    // Helper to upgrade an instance with a CE definition using "constructor call trick"
    function internalUpgrade(
        instance: HTMLElement,
        registeredDefinition: Definition,
        pivotDefinition: Definition
    ) {
        setPrototypeOf(instance, pivotDefinition.UserCtor.prototype);
        definitionForElement.set(instance, pivotDefinition);
        // attributes patches when needed
        if (pivotDefinition !== registeredDefinition) {
            patchAttributes(instance, registeredDefinition, pivotDefinition);
        }
        // Tricking the construction path to believe that a new instance is being created,
        // that way it will execute the super initialization mechanism but the HTMLElement
        // constructor will reuse the instance by returning the upgradingInstance.
        // This is by far the most important piece of the puzzle
        upgradingInstance = instance;
        // By `new`ing the UserCtor, we now jump to the constructor for the overridden global HTMLElement
        // The reason this happens is that the UserCtor extends HTMLElement, so it calls the `super()`.
        // Note that `upgradingInstance` is explicitly handled in the HTMLElement constructor.
        new pivotDefinition.UserCtor();

        patchAttributesDuringUpgrade(instance, registeredDefinition, pivotDefinition);
    }

    function isConstructor(constructor: CustomElementConstructor): boolean {
        return isFunction(constructor) && isObject(constructor.prototype);
    }

    function getOrCreateDefinitionForConstructor(
        constructor: CustomElementConstructor
    ): Definition {
        if (!isConstructor(constructor)) {
            throw new TypeError('The referenced constructor is not a constructor.');
        }
        const definition = definitionForConstructor.get(constructor);
        if (!isUndefined(definition)) {
            return definition;
        }
        return createDefinitionRecord(constructor);
    }

    const { customElements: nativeRegistry } = window;
    const { define: nativeDefine, whenDefined: nativeWhenDefined, get: nativeGet } = nativeRegistry;

    // patch for the global registry define mechanism
    CustomElementRegistry.prototype.define = function define(
        this: CustomElementRegistry,
        tagName: string,
        constructor: CustomElementConstructor,
        options?: ElementDefinitionOptions
    ): void {
        if (options && options.extends) {
            // TODO [#2983]: should we support `extends`?
            throw new DOMException(
                'NotSupportedError: "extends" key in customElements.define() options is not supported.'
            );
        }
        if (globalDefinitionsByTag.has(tagName)) {
            throw new DOMException(
                `Failed to execute 'define' on 'CustomElementRegistry': the name "${tagName}" has already been used with this registry`
            );
        }
        if (!isUndefined(globalDefinitionsByClass.get(constructor))) {
            throw new DOMException(
                `Failed to execute 'define' on 'CustomElementRegistry': this constructor has already been used with this registry`
            );
        }
        const definition = getOrCreateDefinitionForConstructor(constructor);
        registeredUserCtors.add(constructor);
        let PivotCtor = pivotCtorByTag.get(tagName);
        if (isUndefined(PivotCtor)) {
            PivotCtor = createPivotingClass(tagName, definition);
            // Register a pivoting class which will handle global registry initializations
            nativeDefine.call(nativeRegistry, tagName, PivotCtor);
        }
        // Only cache after nativeDefine has been called, because if it throws an error
        // (e.g. for an invalid tag name), then we don't want to cache anything.
        definitionForConstructor.set(constructor, definition);
        pivotCtorByTag.set(tagName, PivotCtor);
        globalDefinitionsByTag.set(tagName, definition);
        globalDefinitionsByClass.set(constructor, definition);
        // For globally defined custom elements, the definition associated
        // to the UserCtor has a back-pointer to PivotCtor in case the user
        // new the UserCtor, so we know how to create the underlying element.
        definition.PivotCtor = PivotCtor;
        // Upgrade any elements created in this scope before customElements.define
        // was called, which should be exhibited by the following steps:
        // 1) LWC registers a tagName for an LWC component.
        // 2) Element with same tagName is created with document.createElement()
        //    and inserted into DOM.
        // 3) customElements.define() is called with tagName and non-LWC constructor.
        // This requires immediate upgrade when the new global tagName is defined.
        const awaiting = awaitingUpgrade.get(tagName);
        if (!isUndefined(awaiting)) {
            awaitingUpgrade.delete(tagName);
            for (const element of awaiting) {
                const registeredDefinition = pendingRegistryForElement.get(element)!;
                // At this point, registeredDefinition should never be undefined because awaitingUpgrade
                // is only populated when we haven't run internalUpgrade yet, and we only populate
                // pendingRegistryForElement when internalUpgrade hasn't run yet.
                // But just to be safe, we check.
                if (!isUndefined(registeredDefinition)) {
                    pendingRegistryForElement.delete(element);
                    internalUpgrade(element, registeredDefinition, definition);
                }
            }
        }
    };

    CustomElementRegistry.prototype.get = function get(
        this: CustomElementRegistry,
        tagName: string
    ): CustomElementConstructor | undefined {
        const NativeCtor = nativeGet.call(nativeRegistry, tagName);
        if (!isUndefined(NativeCtor)) {
            const definition = globalDefinitionsByTag.get(tagName);
            if (!isUndefined(definition)) {
                return definition.UserCtor; // defined by the patched custom elements registry
            }
            // TODO [#3073]: return undefined rather than the pivot constructor (NativeCtor)
            return NativeCtor; // return the pivot constructor or constructor that existed before patching
        }
    };

    CustomElementRegistry.prototype.whenDefined = function whenDefined(
        this: CustomElementRegistry,
        tagName: string
    ): Promise<CustomElementConstructor> {
        return nativeWhenDefined.call(nativeRegistry, tagName).then((NativeCtor) => {
            const definition = globalDefinitionsByTag.get(tagName);
            if (!isUndefined(definition)) {
                return definition.UserCtor;
            }
            // TODO [#3073]: return undefined rather than the pivot constructor (NativeCtor)

            // In this case, the custom element must have been defined before the registry patches
            // were applied. So return the non-pivot constructor
            if (isUndefined(NativeCtor)) {
                // Chromium bug: https://bugs.chromium.org/p/chromium/issues/detail?id=1335247
                // We can patch the correct behavior using customElements.get()
                return nativeGet.call(nativeRegistry, tagName)!;
            }
            return NativeCtor;
        });
    };

    // This constructor is invoked when we call `new pivotDefinition.UserCtor()`
    // @ts-ignore
    window.HTMLElement = function HTMLElement(this: HTMLElement) {
        // Upgrading case: the pivoting class constructor was run by the browser's
        // native custom elements and we're in the process of running the
        // "constructor-call trick" on the natively constructed instance, so just
        // return that here.
        // This code path is also called when LWC `new`s a PivotCtor.
        const instance = upgradingInstance;
        if (!isUndefined(instance)) {
            upgradingInstance = undefined;
            return instance;
        }
        // Construction case: we need to construct the pivoting instance and return it.
        // This is possible when the user register it via global registry and instantiate
        // it via `new Ctor()`.
        const { constructor } = this;
        const definition = globalDefinitionsByClass.get(constructor as CustomElementConstructor);
        if (isUndefined(definition) || isUndefined(definition.PivotCtor)) {
            // This code path is hit if someone `new`s a class that extends `HTMLElement` without
            // doing `customElements.define()` first. This matches native browser behavior:
            // https://stackoverflow.com/a/61883392
            throw new TypeError('Illegal constructor');
        }
        // This constructor is ONLY invoked when it is the user instantiating
        // an element via new Ctor while Ctor is a registered global constructor.
        const { PivotCtor, UserCtor } = definition;
        return new PivotCtor(UserCtor);
    };
    HTMLElement.prototype = NativeHTMLElement.prototype;

    /**
     * Create a new PivotConstructor for the given tagName, which is capable of being constructed
     * with a UserConstructor defining the behavior. Passing in the UserConstructor here
     * is a hint that can be used when registering a custom element with the global custom elements
     * registry for the first time, which provides certain optimizations. It also marks the UserConstructor
     * as "safe" to be used when passed in to a PivotConstructor.
     *
     * @param tagName - element tag name
     * @param UserCtor - userland custom element constructor
     * @returns a new custom element constructor
     */
    return function createPivotConstructor(
        tagName: string,
        UserCtor: CustomElementConstructor
    ): CustomElementConstructor {
        tagName = StringToLowerCase.call(tagName);
        let PivotCtor = pivotCtorByTag.get(tagName);
        if (isUndefined(PivotCtor)) {
            const definition = getOrCreateDefinitionForConstructor(UserCtor);
            PivotCtor = createPivotingClass(tagName, definition);
            // Register a pivoting class as a global custom element
            nativeDefine.call(nativeRegistry, tagName, PivotCtor);
            definition.PivotCtor = PivotCtor;
            // Only cache after nativeDefine has been called, because if it throws an error
            // (e.g. for an invalid tag name), then we don't want to cache anything.
            definitionForConstructor.set(UserCtor, definition);
            pivotCtorByTag.set(tagName, PivotCtor);
        }
        // Register a UserConstructor as "safe" to be used within a PivotConstructor
        registeredUserCtors.add(UserCtor);
        return PivotCtor;
    };
}
