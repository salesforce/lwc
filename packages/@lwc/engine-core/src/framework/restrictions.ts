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
import { globalHTMLProperties } from './attributes';
import { getAssociatedVM, getAssociatedVMIfPresent, hasShadow, VM } from './vm';
import { logError } from '../shared/logger';
import { getComponentTag } from '../shared/format';

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

function logMissingPortalError(name: string, type: string) {
    return logError(
        `The \`${name}\` ${type} is available only on elements that use the \`lwc:dom="manual"\` directive.`
    );
}

export function patchElementWithRestrictions(elm: Element, options: { isPortal: boolean }): void {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    const originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML')!;
    const descriptors: PropertyDescriptorMap = {
        outerHTML: generateAccessorDescriptor({
            get(this: Element): string {
                return originalOuterHTMLDescriptor.get!.call(this);
            },
            set(this: Element, _value: string) {
                throw new TypeError(`Invalid attempt to set outerHTML on Element.`);
            },
        }),
    };

    // Apply extra restriction related to DOM manipulation if the element is not a portal.
    if (isFalse(options.isPortal)) {
        const { appendChild, insertBefore, removeChild, replaceChild } = elm;

        const originalNodeValueDescriptor = getPropertyDescriptor(elm, 'nodeValue')!;
        const originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML')!;
        const originalTextContentDescriptor = getPropertyDescriptor(elm, 'textContent')!;

        assign(descriptors, {
            appendChild: generateDataDescriptor({
                value(this: Node, aChild: Node) {
                    logMissingPortalError('appendChild', 'method');
                    return appendChild.call(this, aChild);
                },
            }),
            insertBefore: generateDataDescriptor({
                value(this: Node, newNode: Node, referenceNode: Node) {
                    if (!isDomMutationAllowed) {
                        logMissingPortalError('insertBefore', 'method');
                    }
                    return insertBefore.call(this, newNode, referenceNode);
                },
            }),
            removeChild: generateDataDescriptor({
                value(this: Node, aChild: Node) {
                    if (!isDomMutationAllowed) {
                        logMissingPortalError('removeChild', 'method');
                    }
                    return removeChild.call(this, aChild);
                },
            }),
            replaceChild: generateDataDescriptor({
                value(this: Node, newChild: Node, oldChild: Node) {
                    logMissingPortalError('replaceChild', 'method');
                    return replaceChild.call(this, newChild, oldChild);
                },
            }),
            nodeValue: generateAccessorDescriptor({
                get(this: Node) {
                    return originalNodeValueDescriptor.get!.call(this);
                },
                set(this: Node, value: string) {
                    if (!isDomMutationAllowed) {
                        logMissingPortalError('nodeValue', 'property');
                    }
                    originalNodeValueDescriptor.set!.call(this, value);
                },
            }),
            textContent: generateAccessorDescriptor({
                get(this: Node): string {
                    return originalTextContentDescriptor.get!.call(this);
                },
                set(this: Node, value: string) {
                    logMissingPortalError('textContent', 'property');
                    originalTextContentDescriptor.set!.call(this, value);
                },
            }),
            innerHTML: generateAccessorDescriptor({
                get(): string {
                    return originalInnerHTMLDescriptor.get!.call(this);
                },
                set(this: Element, value: string) {
                    logMissingPortalError('innerHTML', 'property');
                    return originalInnerHTMLDescriptor.set!.call(this, value);
                },
            }),
        });
    }

    defineProperties(elm, descriptors);
}

function getShadowRootRestrictionsDescriptors(sr: ShadowRoot): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    // Disallowing properties in dev mode only to avoid people doing the wrong
    // thing when using the real shadow root, because if that's the case,
    // the component will not work when running with synthetic shadow.
    const originalAddEventListener = sr.addEventListener;
    const originalInnerHTMLDescriptor = getPropertyDescriptor(sr, 'innerHTML')!;
    const originalTextContentDescriptor = getPropertyDescriptor(sr, 'textContent')!;

    return {
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
    };
}

// Custom Elements Restrictions:
// -----------------------------

function reportInvalidSlotMutationInLightDOM(vm: VM): never {
    throw new Error(
        `Invalid DOM operation on ${getComponentTag(
            vm
        )}. Light DOM component don't allow imperative slotted content.`
    );
}

function getCustomElementRestrictionsDescriptors(elm: HTMLElement): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    const originalAddEventListener = elm.addEventListener;
    const originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML')!;
    const originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML')!;
    const originalTextContentDescriptor = getPropertyDescriptor(elm, 'textContent')!;

    const descriptors: PropertyDescriptorMap = {
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
    };

    const vm = getAssociatedVM(elm);
    if (!hasShadow(vm)) {
        const { appendChild, insertBefore, replaceChild } = elm;

        assign(descriptors, {
            insertBefore: generateDataDescriptor({
                value(this: Node, newNode: Node, referenceNode: Node) {
                    if (!isDomMutationAllowed) {
                        reportInvalidSlotMutationInLightDOM(vm);
                    }
                    return insertBefore.call(this, newNode, referenceNode);
                },
            }),
            appendChild: generateDataDescriptor({
                value(this: Node, aChild: Node) {
                    if (!isDomMutationAllowed) {
                        reportInvalidSlotMutationInLightDOM(vm);
                    }
                    return appendChild.call(this, aChild);
                },
            }),
            replaceChild: generateDataDescriptor({
                value(this: Node, newChild: Node, oldChild: Node) {
                    if (!isDomMutationAllowed) {
                        reportInvalidSlotMutationInLightDOM(vm);
                    }
                    return replaceChild.call(this, newChild, oldChild);
                },
            }),
        });
    }

    return descriptors;
}

function getComponentRestrictionsDescriptors(): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    return {
        tagName: generateAccessorDescriptor({
            get(this: LightningElement) {
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
            get(this: LightningElement) {
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
            set(this: LightningElement) {
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

export function patchComponentWithRestrictions(cmp: LightningElement) {
    defineProperties(cmp, getComponentRestrictionsDescriptors());
}

export function patchLightningElementPrototypeWithRestrictions(
    proto: typeof LightningElement.prototype
) {
    defineProperties(proto, getLightningElementPrototypeRestrictionsDescriptors(proto));
}
