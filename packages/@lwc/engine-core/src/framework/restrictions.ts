/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint lwc-internal/no-production-assert: "off" */
import {
    assign,
    create,
    defineProperties,
    forEach,
    getOwnPropertyNames,
    getPropertyDescriptor,
    getPrototypeOf,
    isFalse,
    isUndefined,
    setPrototypeOf,
    isObject,
    isNull,
} from '@lwc/shared';

import { LightningElement } from './base-lightning-element';
import { ComponentInterface } from './component';
import { globalHTMLProperties } from './attributes';
import { getAssociatedVM, getAssociatedVMIfPresent } from './vm';
import { logError } from '../shared/logger';
import { getComponentTag } from '../shared/format';

interface RestrictionsOptions {
    isPortal?: boolean;
}

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
    options: RestrictionsOptions = {}
): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    const originalTextContentDescriptor = getPropertyDescriptor(node, 'textContent')!;
    const originalNodeValueDescriptor = getPropertyDescriptor(node, 'nodeValue')!;

    const { appendChild, insertBefore, removeChild, replaceChild } = node;
    return {
        appendChild: generateDataDescriptor({
            value(this: Node, aChild: Node) {
                if (this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('appendChild', 'method'));
                }
                return appendChild.call(this, aChild);
            },
        }),
        insertBefore: generateDataDescriptor({
            value(this: Node, newNode: Node, referenceNode: Node) {
                if (!isDomMutationAllowed && this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('insertBefore', 'method'));
                }
                return insertBefore.call(this, newNode, referenceNode);
            },
        }),
        removeChild: generateDataDescriptor({
            value(this: Node, aChild: Node) {
                if (!isDomMutationAllowed && this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('removeChild', 'method'));
                }
                return removeChild.call(this, aChild);
            },
        }),
        replaceChild: generateDataDescriptor({
            value(this: Node, newChild: Node, oldChild: Node) {
                if (this instanceof Element && isFalse(options.isPortal)) {
                    logError(portalRestrictionErrorMessage('replaceChild', 'method'));
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
                    logError(portalRestrictionErrorMessage('nodeValue', 'property'));
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
                    logError(portalRestrictionErrorMessage('textContent', 'property'));
                }
                originalTextContentDescriptor.set!.call(this, value);
            },
        }),
    };
}

function getElementRestrictionsDescriptors(
    elm: Element,
    options: RestrictionsOptions
): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const descriptors = getNodeRestrictionsDescriptors(elm, options);
    const originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML')!;
    const originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML')!;
    assign(descriptors, {
        innerHTML: generateAccessorDescriptor({
            get(): string {
                return originalInnerHTMLDescriptor.get!.call(this);
            },
            set(this: Element, value: string) {
                if (isFalse(options.isPortal)) {
                    logError(
                        portalRestrictionErrorMessage('innerHTML', 'property'),
                        getAssociatedVMIfPresent(this)
                    );
                }
                return originalInnerHTMLDescriptor.set!.call(this, value);
            },
        }),
        outerHTML: generateAccessorDescriptor({
            get(this: Element): string {
                return originalOuterHTMLDescriptor.get!.call(this);
            },
            set(this: Element, _value: string) {
                throw new TypeError(`Invalid attempt to set outerHTML on Element.`);
            },
        }),
    });
    return descriptors;
}

const BLOCKED_SHADOW_ROOT_METHODS = [
    'cloneNode',
    'getElementById',
    'getSelection',
    'elementsFromPoint',
    'dispatchEvent',
];

function getShadowRootRestrictionsDescriptors(sr: ShadowRoot): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    // Disallowing properties in dev mode only to avoid people doing the wrong
    // thing when using the real shadow root, because if that's the case,
    // the component will not work when running with synthetic shadow.
    const originalAddEventListener = sr.addEventListener;
    const descriptors = getNodeRestrictionsDescriptors(sr);
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
                // TODO [#420]: this is triggered when the component author attempts to add a listener
                // programmatically into its Component's shadow root
                if (!isUndefined(options)) {
                    logError(
                        'The `addEventListener` method in `LightningElement` does not support any options.',
                        getAssociatedVMIfPresent(this)
                    );
                }
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                return originalAddEventListener.apply(this, arguments);
            },
        }),
    });

    forEach.call(BLOCKED_SHADOW_ROOT_METHODS, (methodName: string) => {
        descriptors[methodName] = generateAccessorDescriptor({
            get() {
                throw new Error(`Disallowed method "${methodName}" in ShadowRoot.`);
            },
        });
    });

    return descriptors;
}

// Custom Elements Restrictions:
// -----------------------------

function getCustomElementRestrictionsDescriptors(elm: HTMLElement): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const descriptors = getNodeRestrictionsDescriptors(elm);

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
                // TODO [#420]: this is triggered when the component author attempts to add a listener
                // programmatically into a lighting element node
                if (!isUndefined(options)) {
                    logError(
                        'The `addEventListener` method in `LightningElement` does not support any options.',
                        getAssociatedVMIfPresent(this)
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
                    `Usage of property \`tagName\` is disallowed because the component itself does` +
                        ` not know which tagName will be used to create the element, therefore writing` +
                        ` code that check for that value is error prone.`
                );
            },
            configurable: true,
            enumerable: false, // no enumerable properties on component
        }),
    };
}

function getLightningElementPrototypeRestrictionsDescriptors(
    proto: typeof LightningElement.prototype
): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    const originalDispatchEvent = proto.dispatchEvent;

    const descriptors: PropertyDescriptorMap = {
        dispatchEvent: generateDataDescriptor({
            value(this: LightningElement, event: Event): boolean {
                const vm = getAssociatedVM(this);

                if (!isNull(event) && isObject(event)) {
                    const { type } = event;

                    if (!/^[a-z][a-z0-9_]*$/.test(type)) {
                        logError(
                            `Invalid event type "${type}" dispatched in element ${getComponentTag(
                                vm
                            )}.` +
                                ` Event name must start with a lowercase letter and followed only lowercase` +
                                ` letters, numbers, and underscores`,
                            vm
                        );
                    }
                }

                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                return originalDispatchEvent.apply(this, arguments);
            },
        }),
    };

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
                logError(msg.join('\n'), getAssociatedVM(this));
            },
            set(this: ComponentInterface) {
                const { readOnly } = globalHTMLProperties[propName];
                if (readOnly) {
                    logError(
                        `The global HTML property \`${propName}\` is read-only.`,
                        getAssociatedVM(this)
                    );
                }
            },
        });
    });

    return descriptors;
}

export function patchElementWithRestrictions(elm: Element, options: RestrictionsOptions) {
    defineProperties(elm, getElementRestrictionsDescriptors(elm, options));
}

// This routine will prevent access to certain properties on a shadow root instance to guarantee
// that all components will work fine in IE11 and other browsers without shadow dom support.
export function patchShadowRootWithRestrictions(sr: ShadowRoot) {
    defineProperties(sr, getShadowRootRestrictionsDescriptors(sr));
}

export function patchCustomElementWithRestrictions(elm: HTMLElement) {
    const restrictionsDescriptors = getCustomElementRestrictionsDescriptors(elm);
    const elmProto = getPrototypeOf(elm);
    setPrototypeOf(elm, create(elmProto, restrictionsDescriptors));
}

export function patchComponentWithRestrictions(cmp: ComponentInterface) {
    defineProperties(cmp, getComponentRestrictionsDescriptors());
}

export function patchLightningElementPrototypeWithRestrictions(
    proto: typeof LightningElement.prototype
) {
    defineProperties(proto, getLightningElementPrototypeRestrictionsDescriptors(proto));
}
