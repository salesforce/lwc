/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint no-production-assert: "off" */

import assert from '../shared/assert';
import {
    ArraySlice,
    assign,
    create,
    defineProperties,
    forEach,
    getOwnPropertyNames,
    getPropertyDescriptor,
    getPrototypeOf,
    isString,
    isUndefined,
    setPrototypeOf,
    StringToLowerCase,
    toString,
} from '../shared/language';
import { ComponentInterface } from './component';
import {
    getGlobalHTMLPropertiesInfo,
    getPropNameFromAttrName,
    isAttributeLocked,
} from './attributes';
import { isBeingConstructed, isRendering, vmBeingRendered } from './invoker';
import { getShadowRootVM, getCustomElementVM, VM, getNodeOwnerKey, getComponentVM } from './vm';
import {
    getAttribute,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
} from '../env/element';

function generateDataDescriptor(options: PropertyDescriptor): PropertyDescriptor {
    return assign(
        {
            configurable: true,
            enumerable: true,
            writable: true,
        },
        options
    );
}

function generateAccessorDescriptor(options: PropertyDescriptor): PropertyDescriptor {
    return assign(
        {
            configurable: true,
            enumerable: true,
        },
        options
    );
}

let isDomMutationAllowed = false;

export function unlockDomMutation() {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    isDomMutationAllowed = true;
}

export function lockDomMutation() {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    isDomMutationAllowed = false;
}

function getNodeRestrictionsDescriptors(
    node: Node,
    options: RestrictionsOptions
): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    // getPropertyDescriptor here recursively looks up the prototype chain
    // and returns the first descriptor for the property
    const originalTextContentDescriptor = getPropertyDescriptor(node, 'textContent')!;
    const originalNodeValueDescriptor = getPropertyDescriptor(node, 'nodeValue')!;
    const { appendChild, insertBefore, removeChild, replaceChild } = node;
    return {
        appendChild: generateDataDescriptor({
            value(this: Node, aChild: Node) {
                if (this instanceof Element && options.isPortal !== true) {
                    assert.logError(
                        `appendChild is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`,
                        this
                    );
                }
                return appendChild.call(this, aChild);
            },
        }),
        insertBefore: generateDataDescriptor({
            value(this: Node, newNode: Node, referenceNode: Node) {
                if (!isDomMutationAllowed && this instanceof Element && options.isPortal !== true) {
                    assert.logError(
                        `insertBefore is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`,
                        this
                    );
                }
                return insertBefore.call(this, newNode, referenceNode);
            },
        }),
        removeChild: generateDataDescriptor({
            value(this: Node, aChild: Node) {
                if (!isDomMutationAllowed && this instanceof Element && options.isPortal !== true) {
                    assert.logError(
                        `removeChild is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`,
                        this
                    );
                }
                return removeChild.call(this, aChild);
            },
        }),
        replaceChild: generateDataDescriptor({
            value(this: Node, newChild: Node, oldChild: Node) {
                if (this instanceof Element && options.isPortal !== true) {
                    assert.logError(
                        `replaceChild is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`,
                        this
                    );
                }
                return replaceChild.call(this, newChild, oldChild);
            },
        }),
        nodeValue: generateAccessorDescriptor({
            get(this: Node) {
                return originalNodeValueDescriptor.get!.call(this);
            },
            set(this: Node, value: string) {
                if (!isDomMutationAllowed && this instanceof Element && options.isPortal !== true) {
                    assert.logError(
                        `nodeValue is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`,
                        this
                    );
                }
                originalNodeValueDescriptor.set!.call(this, value);
            },
        }),
        textContent: generateAccessorDescriptor({
            get(this: Node): string {
                return originalTextContentDescriptor.get!.call(this);
            },
            set(this: Node, value: string) {
                if (this instanceof Element && options.isPortal !== true) {
                    assert.logError(
                        `textContent is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`,
                        this
                    );
                }
                originalTextContentDescriptor.set!.call(this, value);
            },
        }),
    };
}

function getElementRestrictionsDescriptors(
    elm: HTMLElement,
    options: RestrictionsOptions
): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(elm, options);
    const originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML')!;
    const originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML')!;
    assign(descriptors, {
        innerHTML: generateAccessorDescriptor({
            get(): string {
                return originalInnerHTMLDescriptor.get!.call(this);
            },
            set(this: HTMLElement, value: string) {
                if (options.isPortal !== true) {
                    assert.logError(
                        `innerHTML is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`,
                        this
                    );
                }
                return originalInnerHTMLDescriptor.set!.call(this, value);
            },
        }),
        outerHTML: generateAccessorDescriptor({
            get(this: HTMLElement): string {
                return originalOuterHTMLDescriptor.get!.call(this);
            },
            set(this: HTMLElement, _value: string) {
                throw new TypeError(`Invalid attempt to set outerHTML on Element.`);
            },
        }),
    });
    return descriptors;
}

function getShadowRootRestrictionsDescriptors(
    sr: ShadowRoot,
    options: RestrictionsOptions
): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    // blacklisting properties in dev mode only to avoid people doing the wrong
    // thing when using the real shadow root, because if that's the case,
    // the component will not work when running with synthetic shadow.
    const originalQuerySelector = sr.querySelector;
    const originalQuerySelectorAll = sr.querySelectorAll;
    const originalAddEventListener = sr.addEventListener;
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(sr, options);
    const originalInnerHTMLDescriptor = getPropertyDescriptor(sr, 'innerHTML')!;
    const originalTextContentDescriptor = getPropertyDescriptor(sr, 'textContent')!;
    assign(descriptors, {
        innerHTML: generateAccessorDescriptor({
            get(this: ShadowRoot): string {
                return originalInnerHTMLDescriptor.get!.call(this);
            },
            set(this: ShadowRoot, _value: string) {
                throw new TypeError(`Invalid attempt to set innerHTML on ShadowRoot.`);
            },
        }),
        textContent: generateAccessorDescriptor({
            get(this: ShadowRoot): string {
                return originalTextContentDescriptor.get!.call(this);
            },
            set(this: ShadowRoot, _value: string) {
                throw new TypeError(`Invalid attempt to set textContent on ShadowRoot.`);
            },
        }),
        addEventListener: generateDataDescriptor({
            value(this: ShadowRoot, type: string) {
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${toString(
                        sr
                    )} by adding an event listener for "${type}".`
                );
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                return originalAddEventListener.apply(this, arguments);
            },
        }),
        querySelector: generateDataDescriptor({
            value(this: ShadowRoot) {
                const vm = getShadowRootVM(this);
                assert.isFalse(
                    isBeingConstructed(vm),
                    `this.template.querySelector() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`
                );
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                return originalQuerySelector.apply(this, arguments);
            },
        }),
        querySelectorAll: generateDataDescriptor({
            value(this: ShadowRoot) {
                const vm = getShadowRootVM(this);
                assert.isFalse(
                    isBeingConstructed(vm),
                    `this.template.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`
                );
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                return originalQuerySelectorAll.apply(this, arguments);
            },
        }),
    });
    const BlackListedShadowRootMethods = {
        cloneNode: 0,
        getElementById: 0,
        getSelection: 0,
        elementsFromPoint: 0,
        dispatchEvent: 0,
    };
    forEach.call(getOwnPropertyNames(BlackListedShadowRootMethods), (methodName: string) => {
        const descriptor = generateAccessorDescriptor({
            get() {
                throw new Error(`Disallowed method "${methodName}" in ShadowRoot.`);
            },
        });
        descriptors[methodName] = descriptor;
    });
    return descriptors;
}

// Custom Elements Restrictions:
// -----------------------------

function getAttributePatched(this: HTMLElement, attrName: string): string | null {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getCustomElementVM(this);
        assertAttributeReflectionCapability(vm, attrName);
    }

    return getAttribute.apply(this, ArraySlice.call(arguments));
}

function setAttributePatched(this: HTMLElement, attrName: string, _newValue: any) {
    const vm = getCustomElementVM(this);
    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    setAttribute.apply(this, ArraySlice.call(arguments));
}

function setAttributeNSPatched(
    this: HTMLElement,
    attrNameSpace: string,
    attrName: string,
    _newValue: any
) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    setAttributeNS.apply(this, ArraySlice.call(arguments));
}

function removeAttributePatched(this: HTMLElement, attrName: string) {
    const vm = getCustomElementVM(this);
    // marking the set is needed for the AOM polyfill
    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    removeAttribute.apply(this, ArraySlice.call(arguments));
}

function removeAttributeNSPatched(this: HTMLElement, attrNameSpace: string, attrName: string) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    removeAttributeNS.apply(this, ArraySlice.call(arguments));
}

function assertAttributeReflectionCapability(vm: VM, attrName: string) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const propName = isString(attrName)
        ? getPropNameFromAttrName(StringToLowerCase.call(attrName))
        : null;
    const {
        elm,
        def: { props: propsConfig },
    } = vm;

    if (
        !isUndefined(getNodeOwnerKey(elm)) &&
        isAttributeLocked(elm, attrName) &&
        propsConfig &&
        propName &&
        propsConfig[propName]
    ) {
        assert.logError(
            `Invalid attribute "${StringToLowerCase.call(
                attrName
            )}" for ${vm}. Instead access the public property with \`element.${propName};\`.`,
            elm
        );
    }
}

function assertAttributeMutationCapability(vm: VM, attrName: string) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { elm } = vm;
    if (!isUndefined(getNodeOwnerKey(elm)) && isAttributeLocked(elm, attrName)) {
        assert.logError(
            `Invalid operation on Element ${vm}. Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute "${attrName}", you can update the state of the component, and let the engine to rehydrate the element accordingly.`,
            elm
        );
    }
}

function getCustomElementRestrictionsDescriptors(
    elm: HTMLElement,
    options: RestrictionsOptions
): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(elm, options);
    const originalAddEventListener = elm.addEventListener;
    const originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML')!;
    const originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML')!;
    const originalTextContentDescriptor = getPropertyDescriptor(elm, 'textContent')!;
    return assign(descriptors, {
        innerHTML: generateAccessorDescriptor({
            get(this: HTMLElement): string {
                return originalInnerHTMLDescriptor.get!.call(this);
            },
            set(this: HTMLElement, _value: string) {
                throw new TypeError(`Invalid attempt to set innerHTML on HTMLElement.`);
            },
        }),
        outerHTML: generateAccessorDescriptor({
            get(this: HTMLElement): string {
                return originalOuterHTMLDescriptor.get!.call(this);
            },
            set(this: HTMLElement, _value: string) {
                throw new TypeError(`Invalid attempt to set outerHTML on HTMLElement.`);
            },
        }),
        textContent: generateAccessorDescriptor({
            get(this: HTMLElement): string {
                return originalTextContentDescriptor.get!.call(this);
            },
            set(this: HTMLElement, _value: string) {
                throw new TypeError(`Invalid attempt to set textContent on HTMLElement.`);
            },
        }),
        addEventListener: generateDataDescriptor({
            value(this: HTMLElement, type: string) {
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${toString(
                        elm
                    )} by adding an event listener for "${type}".`
                );
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                return originalAddEventListener.apply(this, arguments);
            },
        }),
        // replacing mutators and accessors on the element itself to catch any mutation
        getAttribute: generateDataDescriptor({
            value: getAttributePatched,
        }),
        setAttribute: generateDataDescriptor({
            value: setAttributePatched,
        }),
        setAttributeNS: generateDataDescriptor({
            value: setAttributeNSPatched,
        }),
        removeAttribute: generateDataDescriptor({
            value: removeAttributePatched,
        }),
        removeAttributeNS: generateDataDescriptor({
            value: removeAttributeNSPatched,
        }),
    });
}

function getComponentRestrictionsDescriptors(cmp: ComponentInterface): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const originalSetAttribute = cmp.setAttribute;
    return {
        setAttribute: generateDataDescriptor({
            value(this: ComponentInterface, attrName: string, _value: any) {
                // logging errors for experimental and special attributes
                if (isString(attrName)) {
                    const propName = getPropNameFromAttrName(attrName);
                    const info = getGlobalHTMLPropertiesInfo();
                    if (info[propName] && info[propName].attribute) {
                        const { error, experimental } = info[propName];
                        if (error) {
                            assert.logError(error, getComponentVM(this).elm);
                        } else if (experimental) {
                            assert.logError(
                                `Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`,
                                getComponentVM(this).elm
                            );
                        }
                    }
                }
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                originalSetAttribute.apply(this, arguments);
            },
            configurable: true,
            enumerable: false, // no enumerable properties on component
        }),
        tagName: generateAccessorDescriptor({
            get(this: ComponentInterface) {
                throw new Error(
                    `Usage of property \`tagName\` is disallowed because the component itself does not know which tagName will be used to create the element, therefore writing code that check for that value is error prone.`
                );
            },
            configurable: true,
            enumerable: false, // no enumerable properties on component
        }),
    };
}

function getLightingElementProtypeRestrictionsDescriptors(proto: object): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const info = getGlobalHTMLPropertiesInfo();
    const descriptors = {};
    forEach.call(getOwnPropertyNames(info), (propName: string) => {
        if (propName in proto) {
            return; // no need to redefine something that we are already exposing
        }
        descriptors[propName] = generateAccessorDescriptor({
            get(this: ComponentInterface) {
                const { error, attribute, readOnly, experimental } = info[propName];
                const msg: any[] = [];
                msg.push(
                    `Accessing the global HTML property "${propName}" in ${this} is disabled.`
                );
                if (error) {
                    msg.push(error);
                } else {
                    if (experimental) {
                        msg.push(
                            `This is an experimental property that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attribute}" are ignored.`
                        );
                    }
                    if (readOnly) {
                        // TODO - need to improve this message
                        msg.push(`Property is read-only.`);
                    }
                    if (attribute) {
                        msg.push(
                            `"Instead access it via the reflective attribute "${attribute}" with one of these techniques:`
                        );
                        msg.push(
                            `  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`
                        );
                        msg.push(
                            `  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`
                        );
                    }
                }
                assert.logWarning(msg.join('\n'), getComponentVM(this).elm);
            },
            // a setter is required here to avoid TypeError's when an attribute is set in a template but only the above getter is defined
            set() {},
        });
    });
    return descriptors;
}

interface RestrictionsOptions {
    isPortal?: boolean;
}

export function patchElementWithRestrictions(elm: HTMLElement, options: RestrictionsOptions) {
    defineProperties(elm, getElementRestrictionsDescriptors(elm, options));
}

// This routine will prevent access to certain properties on a shadow root instance to guarantee
// that all components will work fine in IE11 and other browsers without shadow dom support.
export function patchShadowRootWithRestrictions(sr: ShadowRoot, options: RestrictionsOptions) {
    defineProperties(sr, getShadowRootRestrictionsDescriptors(sr, options));
}

export function patchCustomElementWithRestrictions(elm: HTMLElement, options: RestrictionsOptions) {
    const restrictionsDescriptors = getCustomElementRestrictionsDescriptors(elm, options);
    const elmProto = getPrototypeOf(elm);
    setPrototypeOf(elm, create(elmProto, restrictionsDescriptors));
}

export function patchComponentWithRestrictions(cmp: ComponentInterface) {
    defineProperties(cmp, getComponentRestrictionsDescriptors(cmp));
}

export function patchLightningElementPrototypeWithRestrictions(proto: object) {
    defineProperties(proto, getLightingElementProtypeRestrictionsDescriptors(proto));
}
