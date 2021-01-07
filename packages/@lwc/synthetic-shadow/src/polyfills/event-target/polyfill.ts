/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties } from '@lwc/shared';
import {
    addEventListener as nativeAddEventListener,
    eventTargetPrototype,
    removeEventListener as nativeRemoveEventListener,
} from '../../env/event-target';
import {
    addCustomElementEventListener,
    removeCustomElementEventListener,
} from '../../faux-shadow/events';
import { isHostElement } from '../../faux-shadow/shadow-root';
import { getEventListenerWrapper } from '../../shared/event-target';

function addEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | AddEventListenerOptions
) {
    if (arguments.length < 2) {
        // Delegate to the browser for throwing these errors.
        // @ts-ignore type-mismatch
        return nativeAddEventListener.apply(this, arguments);
    }
    if (isHostElement(this)) {
        addCustomElementEventListener(this, type, listener);
    } else {
        const wrapperFn = getEventListenerWrapper(listener);
        nativeAddEventListener.call(this, type, wrapperFn, optionsOrCapture);
    }
}

function removeEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | EventListenerOptions
) {
    if (arguments.length < 2) {
        // Delegate to the browser for throwing these errors.
        // @ts-ignore type-mismatch
        return nativeAddEventListener.apply(this, arguments);
    }
    if (isHostElement(this)) {
        removeCustomElementEventListener(this, type, listener);
    } else {
        const wrapperFn = getEventListenerWrapper(listener);
        nativeRemoveEventListener.call(this, type, wrapperFn, optionsOrCapture);
        // Account for listeners that were added before this polyfill was applied
        nativeRemoveEventListener.call(this, type, listener, optionsOrCapture);
    }
}

defineProperties(eventTargetPrototype, {
    addEventListener: {
        value: addEventListener,
        enumerable: true,
        writable: true,
        configurable: true,
    },
    removeEventListener: {
        value: removeEventListener,
        enumerable: true,
        writable: true,
        configurable: true,
    },
});
