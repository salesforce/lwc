/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, defineProperties } from '../shared/language';
import { addCustomElementEventListener, removeCustomElementEventListener } from './events';
import { hasSyntheticShadow } from './shadow-root';

const eventTargetGetter: (this: Event) => Element = getOwnPropertyDescriptor(
    Event.prototype,
    'target'
)!.get!;
const eventCurrentTargetGetter: (this: Event) => Element | null = getOwnPropertyDescriptor(
    Event.prototype,
    'currentTarget'
)!.get!;

// These methods are usually from EventTarget.prototype, but that's not available in IE11, the best best thing
// is Node.prototype, which is an EventTarget as well.
const {
    dispatchEvent,
    addEventListener: superAddEventListener,
    removeEventListener: superRemoveEventListener,
} = Node.prototype;

function addEventListenerPatched(
    this: Element,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
) {
    if (hasSyntheticShadow(this)) {
        addCustomElementEventListener(this, type, listener, options);
    } else {
        superAddEventListener.call(this, type, listener, options);
    }
}

function removeEventListenerPatched(
    this: Element,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
) {
    if (hasSyntheticShadow(this)) {
        removeCustomElementEventListener(this, type, listener, options);
    } else {
        superRemoveEventListener.call(this, type, listener, options);
    }
}

// IE11 doesn't have EventTarget, so we have to patch it conditionally:

if (typeof EventTarget !== 'undefined') {
    defineProperties(EventTarget.prototype, {
        addEventListener: {
            value: addEventListenerPatched,
            enumerable: true,
            writable: true,
            configurable: true,
        },
        removeEventListener: {
            value: removeEventListenerPatched,
            enumerable: true,
            writable: true,
            configurable: true,
        },
    });
} else {
    // IE11 extra patches for wrong prototypes
    defineProperties(Node.prototype, {
        addEventListener: {
            value: addEventListenerPatched,
            enumerable: true,
            writable: true,
            configurable: true,
        },
        removeEventListener: {
            value: removeEventListenerPatched,
            enumerable: true,
            writable: true,
            configurable: true,
        },
    });
}

export { dispatchEvent, eventTargetGetter, eventCurrentTargetGetter };
