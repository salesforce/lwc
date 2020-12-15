/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isFunction, isNull, isObject } from '@lwc/shared';
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

function isValidEventListener(listener: EventListenerOrEventListenerObject): boolean {
    return (
        isFunction(listener) ||
        (!isNull(listener) && isObject(listener) && isFunction(listener.handleEvent))
    );
}

function addEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | AddEventListenerOptions
) {
    // TODO [#2134]: Delegate this validation to the browser instead of silently swallowing
    if (!isValidEventListener(listener)) {
        return;
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
    // TODO [#2134]: Delegate this validation to the browser instead of silently swallowing
    if (!isValidEventListener(listener)) {
        return;
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
