/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isFunction, isNull, isObject } from '@lwc/shared';
import { eventTargetGetter } from '../../env/dom';
import {
    addEventListener as nativeAddEventListener,
    eventTargetPrototype,
    removeEventListener as nativeRemoveEventListener,
} from '../../env/event-target';
import {
    windowRemoveEventListener as nativeWindowRemoveEventListener,
    windowAddEventListener as nativeWindowAddEventListener,
} from '../../env/window';
import { patchEvent } from '../../faux-shadow/events';
import { isNodeDeepShadowed } from '../../shared/node-ownership';

type EventListenerWrapper = EventListener & {
    $$lwcEventWrapper$$: EventListener;
};

function doesEventNeedsPatch(e: Event): boolean {
    const originalTarget = eventTargetGetter.call(e);
    return originalTarget instanceof Node && isNodeDeepShadowed(originalTarget);
}

function isValidEventListener(listener: EventListenerOrEventListenerObject): boolean {
    return (
        isFunction(listener) ||
        (!isNull(listener) && isObject(listener) && isFunction(listener.handleEvent))
    );
}

function getEventListenerWrapper(
    listener: EventListenerOrEventListenerObject | EventListenerWrapper
): EventListener {
    if ('$$lwcEventWrapper$$' in listener) {
        return listener.$$lwcEventWrapper$$;
    }
    const isHandlerFunction = isFunction(listener);
    const wrapperFn = ((listener as EventListenerWrapper).$$lwcEventWrapper$$ = function (
        this: EventTarget,
        e: Event
    ) {
        // we don't want to patch every event, only when the original target is coming
        // from inside a synthetic shadow
        if (doesEventNeedsPatch(e)) {
            patchEvent(e);
        }
        return isHandlerFunction
            ? (listener as EventListener).call(this, e)
            : (listener as EventListenerObject).handleEvent &&
                  (listener as EventListenerObject).handleEvent(e);
    });

    return wrapperFn;
}

function windowAddEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | EventListenerOptions
) {
    if (!isValidEventListener(listener)) {
        return;
    }

    const wrapperFn = getEventListenerWrapper(listener);
    nativeWindowAddEventListener.call(this, type, wrapperFn, optionsOrCapture);
}

function windowRemoveEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | EventListenerOptions
) {
    if (!isValidEventListener(listener)) {
        return;
    }

    const wrapperFn = getEventListenerWrapper(listener);
    // Incase the listener was wrapped by the engine's addEventListener routine
    nativeWindowRemoveEventListener.call(this, type, wrapperFn, optionsOrCapture);
    // If the listener was added before synthetic-shadow was loaded, the listener might not be wrapped
    nativeWindowRemoveEventListener.call(this, type, listener, optionsOrCapture);
}

function addEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | EventListenerOptions
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
    // Incase the listener was wrapped by the engine's addEventListener routine
    nativeRemoveEventListener.call(this, type, wrapperFn, optionsOrCapture);
    // If the listener was added before synthetic-shadow was loaded, the listener might not be wrapped
    nativeRemoveEventListener.call(this, type, listener, optionsOrCapture);
}

// Patching `window` directly because it is neither an instance of EventTarget nor Node in IE11
window.addEventListener = windowAddEventListener;
window.removeEventListener = windowRemoveEventListener;

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
