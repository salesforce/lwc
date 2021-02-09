/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse, isFunction, isNull, isObject, isUndefined } from '@lwc/shared';
import { eventCurrentTargetGetter, eventTargetGetter } from '../env/dom';
import { isHostElement } from '../faux-shadow/shadow-root';

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

            const currentTarget = eventCurrentTargetGetter.call(event) as EventTarget;
            const target = eventTargetGetter.call(event);

            // This check is not meant to be a micro-optimization. It accounts for the edge case
            // where a listener is invoked on an instance of EventTarget (i.e., new EventTarget()).
            if (currentTarget !== target) {
                let composedPath = ComposedPathMap.get(event);
                if (isUndefined(composedPath)) {
                    composedPath = event.composedPath();
                    ComposedPathMap.set(event, composedPath);
                }
                if (!composedPath.includes(currentTarget)) {
                    return;
                }
            }

            return isFunction(fnOrObj)
                ? fnOrObj.call(this, event)
                : fnOrObj.handleEvent && fnOrObj.handleEvent(event);
        };
        EventListenerMap.set(fnOrObj, wrapperFn);
    }

    return wrapperFn;
}
