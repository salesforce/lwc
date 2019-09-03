/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint no-production-assert: "off" */

import { assert } from '@lwc/shared';
import { logError } from '../shared/assert';
import {
    assign,
    create,
    defineProperties,
    forEach,
    getOwnPropertyNames,
    getPropertyDescriptor,
    getPrototypeOf,
    isFalse,
    setPrototypeOf,
    toString,
    isUndefined,
} from '../shared/language';
import { ComponentInterface } from './component';
import { globalHTMLProperties } from './attributes';
import { isBeingConstructed, isRendering, vmBeingRendered } from './invoker';
import { getShadowRootVM, getComponentVM } from './vm';

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

function portalRestrictionErrorMessage(name: string, type: string) {
    return `The \`${name}\` ${type} is available only on elements that use the \`lwc:dom="manual"\` directive.`;
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
                if (this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('appendChild', 'method'), this);
                }
                return appendChild.call(this, aChild);
            },
        }),
        insertBefore: generateDataDescriptor({
            value(this: Node, newNode: Node, referenceNode: Node) {
                if (!isDomMutationAllowed && this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('insertBefore', 'method'), this);
                }
                return insertBefore.call(this, newNode, referenceNode);
            },
        }),
        removeChild: generateDataDescriptor({
            value(this: Node, aChild: Node) {
                if (!isDomMutationAllowed && this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('removeChild', 'method'), this);
                }
                return removeChild.call(this, aChild);
            },
        }),
        replaceChild: generateDataDescriptor({
            value(this: Node, newChild: Node, oldChild: Node) {
                if (this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('replaceChild', 'method'), this);
                }
                return replaceChild.call(this, newChild, oldChild);
            },
        }),
        nodeValue: generateAccessorDescriptor({
            get(this: Node) {
                return originalNodeValueDescriptor.get!.call(this);
            },
            set(this: Node, value: string) {
                if (!isDomMutationAllowed && this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('nodeValue', 'property'), this);
                }
                originalNodeValueDescriptor.set!.call(this, value);
            },
        }),
        textContent: generateAccessorDescriptor({
            get(this: Node): string {
                return originalTextContentDescriptor.get!.call(this);
            },
            set(this: Node, value: string) {
                if (this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('textContent', 'property'), this);
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
                if (isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('innerHTML', 'property'), this);
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
            value(
                this: ShadowRoot,
                type: string,
                listener: EventListener,
                options?: boolean | AddEventListenerOptions
            ) {
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${toString(
                        sr
                    )} by adding an event listener for "${type}".`
                );
                // TODO: #420 - this is triggered when the component author attempts to add a listener
                // programmatically into its Component's shadow root
                if (!isUndefined(options)) {
                    logError(
                        'The `addEventListener` method in `LightningElement` does not support any options.',
                        this.host
                    );
                }
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
            value(
                this: HTMLElement,
                type: string,
                listener: EventListener,
                options?: boolean | AddEventListenerOptions
            ) {
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${toString(
                        this
                    )} by adding an event listener for "${type}".`
                );
                // TODO: #420 - this is triggered when the component author attempts to add a listener
                // programmatically into a lighting element node
                if (!isUndefined(options)) {
                    logError(
                        'The `addEventListener` method in `LightningElement` does not support any options.',
                        this
                    );
                }
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                return originalAddEventListener.apply(this, arguments);
            },
        }),
    });
}

function getComponentRestrictionsDescriptors(): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    return {
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

function getLightningElementPrototypeRestrictionsDescriptors(proto: object): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const descriptors = {};
    forEach.call(getOwnPropertyNames(globalHTMLProperties), (propName: string) => {
        if (propName in proto) {
            return; // no need to redefine something that we are already exposing
        }
        descriptors[propName] = generateAccessorDescriptor({
            get(this: ComponentInterface) {
                const { error, attribute } = globalHTMLProperties[propName];
                const msg: string[] = [];
                msg.push(`Accessing the global HTML property "${propName}" is disabled.`);
                if (error) {
                    msg.push(error);
                } else if (attribute) {
                    msg.push(`Instead access it via \`this.getAttribute("${attribute}")\`.`);
                }
                logError(msg.join('\n'), getComponentVM(this).elm);
            },
            set() {
                const { readOnly } = globalHTMLProperties[propName];
                if (readOnly) {
                    logError(`The global HTML property \`${propName}\` is read-only.`);
                }
            },
        });
    });
    return descriptors;
}

interface RestrictionsOptions {
    isPortal?: boolean;
}

export function markNodeFromVNode(node: Node) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    (node as any).$fromTemplate$ = true;
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
    defineProperties(cmp, getComponentRestrictionsDescriptors());
}

export function patchLightningElementPrototypeWithRestrictions(proto: object) {
    defineProperties(proto, getLightningElementPrototypeRestrictionsDescriptors(proto));
}
