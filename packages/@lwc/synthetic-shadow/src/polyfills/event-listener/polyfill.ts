/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isFunction, isNull, isObject } from '@lwc/shared';
import {
    windowRemoveEventListener as nativeWindowRemoveEventListener,
    windowAddEventListener as nativeWindowAddEventListener,
} from '../../env/window';
import {
    removeEventListener as nativeRemoveEventListener,
    addEventListener as nativeAddEventListener,
} from '../../env/element';
import { eventTargetGetter } from '../../env/dom';
import { patchEvent } from '../../faux-shadow/events';
import { isNodeDeepShadowed } from '../../faux-shadow/node';

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
    nativeWindowRemoveEventListener.call(this, type, wrapperFn || listener, optionsOrCapture);
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
    nativeRemoveEventListener.call(this, type, wrapperFn || listener, optionsOrCapture);
}

// TODO [#1305]: these patches should be on EventTarget.prototype instead of win and node prototypes
//       but IE doesn't support that.
window.addEventListener = windowAddEventListener;
window.removeEventListener = windowRemoveEventListener;

// IE11 doesn't have EventTarget, so we have to patch it conditionally:
const protoToBePatched =
    typeof EventTarget !== 'undefined' ? EventTarget.prototype : Node.prototype;

defineProperties(protoToBePatched, {
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
