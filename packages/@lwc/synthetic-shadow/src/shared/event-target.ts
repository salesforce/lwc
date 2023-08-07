/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse, isFunction, isNull, isObject, isUndefined } from '@lwc/shared';
import { eventCurrentTargetGetter } from '../env/dom';
import { getActualTarget } from '../faux-shadow/events';
import { isSyntheticShadowHost } from '../faux-shadow/shadow-root';

const EventListenerMap: WeakMap<EventListenerOrEventListenerObject, EventListener> = new WeakMap();
const ComposedPathMap: WeakMap<Event, EventTarget[]> = new WeakMap();

function isEventListenerOrEventListenerObject(
    fnOrObj: unknown
): fnOrObj is EventListenerOrEventListenerObject {
    return (
        isFunction(fnOrObj) ||
        (isObject(fnOrObj) &&
            !isNull(fnOrObj) &&
            isFunction((fnOrObj as EventListenerObject).handleEvent))
    );
}

export function shouldInvokeListener(
    event: Event,
    target: EventTarget,
    currentTarget: EventTarget
) {
    // Subsequent logic assumes that `currentTarget` must be contained in the composed path for the listener to be
    // invoked, but this is not always the case. `composedPath()` will sometimes return an empty array, even when the
    // listener should be invoked (e.g., a disconnected instance of EventTarget, an instance of XMLHttpRequest, etc).
    if (target === currentTarget) {
        return true;
    }

    let composedPath = ComposedPathMap.get(event);
    if (isUndefined(composedPath)) {
        composedPath = event.composedPath();
        ComposedPathMap.set(event, composedPath);
    }

    return composedPath.includes(currentTarget);
}

export function getEventListenerWrapper(fnOrObj: unknown) {
    if (!isEventListenerOrEventListenerObject(fnOrObj)) {
        return fnOrObj;
    }

    let wrapperFn = EventListenerMap.get(fnOrObj);
    if (isUndefined(wrapperFn)) {
        wrapperFn = function (this: EventTarget, event: Event) {
            // This function is invoked from an event listener and currentTarget is always defined.
            const currentTarget = eventCurrentTargetGetter.call(event)!;

            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(
                    isFalse(isSyntheticShadowHost(currentTarget)),
                    'This routine should not be used to wrap event listeners for host elements and shadow roots.'
                );
            }

            const actualTarget = getActualTarget(event);
            if (!shouldInvokeListener(event, actualTarget, currentTarget)) {
                return;
            }

            return isFunction(fnOrObj)
                ? fnOrObj.call(this, event)
                : fnOrObj.handleEvent && fnOrObj.handleEvent(event);
        };
        EventListenerMap.set(fnOrObj, wrapperFn);
    }

    return wrapperFn;
}
