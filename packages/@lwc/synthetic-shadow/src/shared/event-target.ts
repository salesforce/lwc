/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse, isFunction, isNull, isObject, isUndefined } from '@lwc/shared';
import { eventCurrentTargetGetter } from '../env/dom';
import { getActualTarget } from '../faux-shadow/events';
import { eventToShadowRootMap, isHostElement } from '../faux-shadow/shadow-root';
import featureFlags from '@lwc/features';
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
    // Handle this case early because some events will return an empty array when composedPath() is
    // invoked (e.g., a disconnected instance of EventTarget, an instance of XMLHttpRequest, etc).
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
        if (featureFlags.ENABLE_COMPOSED_PATH_FIX_REVERT) {
            wrapperFn = function (this: EventTarget, event: Event) {
                if (process.env.NODE_ENV !== 'production') {
                    const currentTarget = eventCurrentTargetGetter.call(event);
                    assert.invariant(
                        isFalse(isHostElement(currentTarget)),
                        'This routine should not be used to wrap event listeners for host elements and shadow roots.'
                    );
                }

                const { composed } = event;

                // TODO [#2121]: We should also be filtering out other non-composed events at this point
                // but we only do so for events dispatched via shadowRoot.dispatchEvent() to preserve
                // the current behavior.
                if (eventToShadowRootMap.has(event) && isFalse(composed)) {
                    return;
                }

                return isFunction(fnOrObj)
                    ? fnOrObj.call(this, event)
                    : fnOrObj.handleEvent && fnOrObj.handleEvent(event);
            };
        } else {
            wrapperFn = function (this: EventTarget, event: Event) {
                //currentTarget can't be null as this function is invoked from an event listener
                const currentTarget = eventCurrentTargetGetter.call(event)!;
                const actualTarget = getActualTarget(event);

                if (process.env.NODE_ENV !== 'production') {
                    assert.invariant(
                        isFalse(isHostElement(currentTarget)),
                        'This routine should not be used to wrap event listeners for host elements and shadow roots.'
                    );
                }

                if (!shouldInvokeListener(event, actualTarget, currentTarget)) {
                    return;
                }

                return isFunction(fnOrObj)
                    ? fnOrObj.call(this, event)
                    : fnOrObj.handleEvent && fnOrObj.handleEvent(event);
            };
        }
        EventListenerMap.set(fnOrObj, wrapperFn);
    }

    return wrapperFn;
}
