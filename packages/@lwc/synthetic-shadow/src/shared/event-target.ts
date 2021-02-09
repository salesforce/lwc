/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse, isFunction, isNull, isObject, isUndefined } from '@lwc/shared';
import { eventCurrentTargetGetter, eventTargetGetter } from '../env/dom';
import { isHostElement, SyntheticShadowRootInterface } from '../faux-shadow/shadow-root';

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

/**
 * Returns true if the listener wrapper handling the event should invoke the actual listener.
 * @param {Event} event - The event being handled by the listener wrapper.
 * @param {SyntheticShadowRootInterface} [shadowRoot] - If the listener wrapper is associated with
 * a synthetic shadow root, it means that event.currentTarget will return the host element instead
 * of the shadow root. In this case, pass a reference to the shadow root.
 */
function shouldInvokeListener(event: Event, shadowRoot?: SyntheticShadowRootInterface) {
    const target = eventTargetGetter.call(event);
    const currentTarget = shadowRoot || (eventCurrentTargetGetter.call(event) as EventTarget);

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
        wrapperFn = function (this: EventTarget, event: Event) {
            if (process.env.NODE_ENV !== 'production') {
                const currentTarget = eventCurrentTargetGetter.call(event);
                assert.invariant(
                    isFalse(isHostElement(currentTarget)),
                    'This routine should not be used to wrap event listeners for host elements and shadow roots.'
                );
            }

            if (!shouldInvokeListener(event)) {
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
