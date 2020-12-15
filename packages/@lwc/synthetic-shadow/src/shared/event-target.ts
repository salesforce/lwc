/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse, isFunction, isUndefined } from '@lwc/shared';
import { eventCurrentTargetGetter } from '../env/dom';

import {
    doesEventNeedPatch,
    eventsDispatchedDirectlyOnShadowRoot,
    patchEvent,
} from '../faux-shadow/events';
import { isHostElement } from '../faux-shadow/shadow-root';

const EventListenerMap: WeakMap<EventListenerOrEventListenerObject, EventListener> = new WeakMap();

export function getEventListenerWrapper(
    fnOrObj: EventListenerOrEventListenerObject
): EventListener {
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
                ? (fnOrObj as EventListener).call(this, event)
                : (fnOrObj as EventListenerObject).handleEvent &&
                      (fnOrObj as EventListenerObject).handleEvent(event);
        };
        EventListenerMap.set(fnOrObj, wrapperFn);
    }

    return wrapperFn;
}
