/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties } from '@lwc/shared';
import { addCustomElementEventListener, removeCustomElementEventListener } from './events';
import { isHostElement } from './shadow-root';
import { eventTargetPrototype } from '../env/event-target';

// These methods are usually from EventTarget.prototype, but that's not available in IE11, the next best thing
// is Node.prototype, which is an EventTarget as well.
const {
    addEventListener: superAddEventListener,
    removeEventListener: superRemoveEventListener,
} = Node.prototype;

function addEventListenerPatched(
    this: Element,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
) {
    if (isHostElement(this)) {
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
    if (isHostElement(this)) {
        removeCustomElementEventListener(this, type, listener, options);
    } else {
        superRemoveEventListener.call(this, type, listener, options);
    }
}

defineProperties(eventTargetPrototype, {
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
