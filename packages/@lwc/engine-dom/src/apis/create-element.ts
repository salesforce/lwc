/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFunction, isNull, isObject, toString, StringToLowerCase } from '@lwc/shared';
import {
    createVM,
    connectRootElement,
    disconnectRootElement,
    LightningElement,
} from '@lwc/engine-core';
import { getUpgradableElement } from '../renderer';

/**
 * EXPERIMENTAL: This function is almost identical to document.createElement with the slightly
 * difference that in the options, you can pass the `is` property set to a Constructor instead of
 * just a string value. The intent is to allow the creation of an element controlled by LWC without
 * having to register the element as a custom element.
 *
 * @example
 * ```
 * const el = createElement('x-foo', { is: FooCtor });
 * ```
 */
export function createElement(
    sel: string,
    options: {
        is: typeof LightningElement;
        mode?: 'open' | 'closed';
    }
): HTMLElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${toString(
                options
            )}".`
        );
    }

    const Ctor = options.is;
    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"createElement" function expects an "is" option with a valid component constructor.`
        );
    }

    // tagName must be all lowercase, unfortunately, we have legacy code that is
    // passing `sel` as a camel-case, which makes them invalid custom elements name
    // the following line guarantees that this does not leaks beyond this point.
    const tagName = StringToLowerCase.call(sel);
    const UpgradableConstructor = getUpgradableElement(tagName);
    let wasComponentUpgraded: boolean = false;
    // the custom element from the registry is expecting an upgrade callback
    /**
     * Note: if the upgradable constructor does not expect, or throw when we new it
     * with a callback as the first argument, we could implement a more advanced
     * mechanism that only passes that argument if the constructor is known to be
     * an upgradable custom element.
     */
    class UserElement extends HTMLElement {
        constructor() {
            super();
            const elm = this;
            createVM(elm, Ctor, {
                tagName,
                mode: options.mode !== 'closed' ? 'open' : 'closed',
                owner: null,
            });
            wasComponentUpgraded = true;
        }
        connectedCallback() {
            connectRootElement(this);
        }
        disconnectedCallback() {
            disconnectRootElement(this);
        }
    }
    const element = new UpgradableConstructor(UserElement.prototype.constructor);
    if (!wasComponentUpgraded) {
        /* eslint-disable-next-line no-console */
        console.error(
            `Unexpected tag name "${tagName}". This name is a registered custom element, preventing LWC to upgrade the element.`
        );
    }
    return element;
}
