/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint @lwc/lwc-internal/no-production-assert: "off" */
import {
    assign,
    create,
    defineProperties,
    getPropertyDescriptor,
    getPrototypeOf,
    isUndefined,
    setPrototypeOf,
} from '@lwc/shared';

import { logError, logWarn } from '../shared/logger';

import { getAssociatedVMIfPresent } from './vm';
import { assertNotProd } from './utils';

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
    assertNotProd(); // this method should never leak to prod
    isDomMutationAllowed = true;
}

export function lockDomMutation() {
    assertNotProd(); // this method should never leak to prod
    isDomMutationAllowed = false;
}

function logMissingPortalWarn(name: string, type: string) {
    return logWarn(
        `The \`${name}\` ${type} is available only on elements that use the \`lwc:dom="manual"\` directive.`
    );
}

export function patchElementWithRestrictions(
    elm: Element,
    options: { isPortal: boolean; isLight: boolean; isSynthetic: boolean }
): void {
    assertNotProd(); // this method should never leak to prod

    const originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML')!;
    const descriptors: PropertyDescriptorMap = {
        outerHTML: generateAccessorDescriptor({
            get(this: Element): string {
                return originalOuterHTMLDescriptor.get!.call(this);
            },
            set(this: Element, value: string) {
                logError(`Invalid attempt to set outerHTML on Element.`);
                return originalOuterHTMLDescriptor.set!.call(this, value);
            },
        }),
    };

    // Apply extra restriction related to DOM manipulation if the element is not a portal.
    if (!options.isLight && options.isSynthetic && !options.isPortal) {
        const { appendChild, insertBefore, removeChild, replaceChild } = elm;

        const originalNodeValueDescriptor = getPropertyDescriptor(elm, 'nodeValue')!;
        const originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML')!;
        const originalTextContentDescriptor = getPropertyDescriptor(elm, 'textContent')!;

        assign(descriptors, {
            appendChild: generateDataDescriptor({
                value(this: Node, aChild: Node) {
                    logMissingPortalWarn('appendChild', 'method');
                    return appendChild.call(this, aChild);
                },
            }),
            insertBefore: generateDataDescriptor({
                value(this: Node, newNode: Node, referenceNode: Node) {
                    if (!isDomMutationAllowed) {
                        logMissingPortalWarn('insertBefore', 'method');
                    }
                    return insertBefore.call(this, newNode, referenceNode);
                },
            }),
            removeChild: generateDataDescriptor({
                value(this: Node, aChild: Node) {
                    if (!isDomMutationAllowed) {
                        logMissingPortalWarn('removeChild', 'method');
                    }
                    return removeChild.call(this, aChild);
                },
            }),
            replaceChild: generateDataDescriptor({
                value(this: Node, newChild: Node, oldChild: Node) {
                    logMissingPortalWarn('replaceChild', 'method');
                    return replaceChild.call(this, newChild, oldChild);
                },
            }),
            nodeValue: generateAccessorDescriptor({
                get(this: Node) {
                    return originalNodeValueDescriptor.get!.call(this);
                },
                set(this: Node, value: string) {
                    if (!isDomMutationAllowed) {
                        logMissingPortalWarn('nodeValue', 'property');
                    }
                    originalNodeValueDescriptor.set!.call(this, value);
                },
            }),
            textContent: generateAccessorDescriptor({
                get(this: Node): string {
                    return originalTextContentDescriptor.get!.call(this);
                },
                set(this: Node, value: string) {
                    logMissingPortalWarn('textContent', 'property');
                    originalTextContentDescriptor.set!.call(this, value);
                },
            }),
            innerHTML: generateAccessorDescriptor({
                get(): string {
                    return originalInnerHTMLDescriptor.get!.call(this);
                },
                set(this: Element, value: string) {
                    logMissingPortalWarn('innerHTML', 'property');
                    return originalInnerHTMLDescriptor.set!.call(this, value);
                },
            }),
        });
    }

    defineProperties(elm, descriptors);
}

function getShadowRootRestrictionsDescriptors(sr: ShadowRoot): PropertyDescriptorMap {
    assertNotProd(); // this method should never leak to prod

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
            set(this: ShadowRoot, value: string) {
                logError(`Invalid attempt to set innerHTML on ShadowRoot.`);
                return originalInnerHTMLDescriptor.set!.call(this, value);
            },
        }),
        textContent: generateAccessorDescriptor({
            get(this: ShadowRoot): string {
                return originalTextContentDescriptor.get!.call(this);
            },
            set(this: ShadowRoot, value: string) {
                logError(`Invalid attempt to set textContent on ShadowRoot.`);
                return originalTextContentDescriptor.set!.call(this, value);
            },
        }),
        addEventListener: generateDataDescriptor({
            value(
                this: ShadowRoot,
                type: string,
                listener: EventListener,
                options?: boolean | AddEventListenerOptions
            ) {
                // TODO [#1824]: Potentially relax this restriction
                if (!isUndefined(options)) {
                    logError(
                        'The `addEventListener` method on ShadowRoot does not support any options.',
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

function getCustomElementRestrictionsDescriptors(elm: HTMLElement): PropertyDescriptorMap {
    assertNotProd(); // this method should never leak to prod

    const originalAddEventListener = elm.addEventListener;
    const originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML')!;
    const originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML')!;
    const originalTextContentDescriptor = getPropertyDescriptor(elm, 'textContent')!;

    return {
        innerHTML: generateAccessorDescriptor({
            get(this: HTMLElement): string {
                return originalInnerHTMLDescriptor.get!.call(this);
            },
            set(this: HTMLElement, value: string) {
                logError(`Invalid attempt to set innerHTML on HTMLElement.`);
                return originalInnerHTMLDescriptor.set!.call(this, value);
            },
        }),
        outerHTML: generateAccessorDescriptor({
            get(this: HTMLElement): string {
                return originalOuterHTMLDescriptor.get!.call(this);
            },
            set(this: HTMLElement, value: string) {
                logError(`Invalid attempt to set outerHTML on HTMLElement.`);
                return originalOuterHTMLDescriptor.set!.call(this, value);
            },
        }),
        textContent: generateAccessorDescriptor({
            get(this: HTMLElement): string {
                return originalTextContentDescriptor.get!.call(this);
            },
            set(this: HTMLElement, value: string) {
                logError(`Invalid attempt to set textContent on HTMLElement.`);
                return originalTextContentDescriptor.set!.call(this, value);
            },
        }),
        addEventListener: generateDataDescriptor({
            value(
                this: HTMLElement,
                type: string,
                listener: EventListener,
                options?: boolean | AddEventListenerOptions
            ) {
                // TODO [#1824]: Potentially relax this restriction
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
