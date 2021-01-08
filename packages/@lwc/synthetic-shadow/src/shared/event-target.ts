/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse, isFunction, isNull, isObject, isUndefined } from '@lwc/shared';
import { eventCurrentTargetGetter } from '../env/dom';

import {
    doesEventNeedPatch,
    eventsDispatchedDirectlyOnShadowRoot,
    patchEvent,
} from '../faux-shadow/events';
import { isHostElement } from '../faux-shadow/shadow-root';

const EventListenerMap: WeakMap<EventListenerOrEventListenerObject, EventListener> = new WeakMap();

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

            const { composed } = event;

            // TODO [#2121]: We should also be filtering out other non-composed events at this point
            // but we only do so for events dispatched via shadowRoot.dispatchEvent() to preserve
            // the current behavior.
            if (eventsDispatchedDirectlyOnShadowRoot.has(event) && isFalse(composed)) {
                return;
            }

            if (doesEventNeedPatch(event)) {
                patchEvent(event);
            }

            return isFunction(fnOrObj)
                ? fnOrObj.call(this, event)
                : fnOrObj.handleEvent && fnOrObj.handleEvent(event);
        };
        EventListenerMap.set(fnOrObj, wrapperFn);
    }

    return wrapperFn;
}
