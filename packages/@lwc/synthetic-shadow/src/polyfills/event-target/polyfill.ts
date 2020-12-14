/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isFunction, isNull, isObject, isUndefined } from '@lwc/shared';
import {
    addEventListener as nativeAddEventListener,
    eventTargetPrototype,
    removeEventListener as nativeRemoveEventListener,
} from '../../env/event-target';
import { doesEventNeedPatch, patchEvent } from '../../faux-shadow/events';

const EventListenerMap: WeakMap<EventListenerOrEventListenerObject, EventListener> = new WeakMap();

function isValidEventListener(listener: EventListenerOrEventListenerObject): boolean {
    return (
        isFunction(listener) ||
        (!isNull(listener) && isObject(listener) && isFunction(listener.handleEvent))
    );
}

function getEventListenerWrapper(fnOrObj: EventListenerOrEventListenerObject): EventListener {
    let wrapperFn = EventListenerMap.get(fnOrObj);
    if (isUndefined(wrapperFn)) {
        wrapperFn = function (this: EventTarget, event: Event) {
            // We don't want to patch every event, only when the original target is coming from
            // inside a synthetic shadow
            if (doesEventNeedPatch(event)) {
                patchEvent(event);
            }
            return isFunction(fnOrObj)
                ? (fnOrObj as EventListener).call(this, event)
                : (fnOrObj as EventListenerObject).handleEvent &&
                      (fnOrObj as EventListenerObject).handleEvent(event);
        };
        EventListenerMap.set(fnOrObj, wrapperFn);
    }
    return wrapperFn;
}

function addEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | AddEventListenerOptions
) {
    if (!isValidEventListener(listener)) {
        return;
    }
    const wrapperFn = getEventListenerWrapper(listener);
    nativeAddEventListener.call(this, type, wrapperFn, optionsOrCapture);
}

function removeEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | EventListenerOptions
) {
    if (!isValidEventListener(listener)) {
        return;
    }
    const wrapperFn = getEventListenerWrapper(listener);
    // In case the listener was wrapped by the engine's addEventListener routine
    nativeRemoveEventListener.call(this, type, wrapperFn, optionsOrCapture);
    // If the listener was added before synthetic-shadow was loaded, the listener might not be wrapped
    nativeRemoveEventListener.call(this, type, listener, optionsOrCapture);
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
