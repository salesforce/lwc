/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isFalse, isFunction, isUndefined } from '@lwc/shared';

import { windowAddEventListener, windowRemoveEventListener } from '../../env/window';
import {
    doesEventNeedPatch,
    eventsDispatchedDirectlyOnShadowRoot,
    patchEvent,
} from '../../faux-shadow/events';

const EventListenerMap: WeakMap<EventListenerOrEventListenerObject, EventListener> = new WeakMap();

function getEventListenerWrapper(fnOrObj: EventListenerOrEventListenerObject): EventListener {
    let wrapperFn = EventListenerMap.get(fnOrObj);
    if (isUndefined(wrapperFn)) {
        wrapperFn = function (this: Window, event: Event) {
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

function addEventListener(
    this: Window,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
) {
    const wrapperFn = getEventListenerWrapper(listener);
    return windowAddEventListener.call(this, type, wrapperFn, options);
}

function removeEventListener(
    this: Window,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
) {
    const wrapperFn = getEventListenerWrapper(listener);
    windowRemoveEventListener.call(this, type, wrapperFn, options);
}

export default function apply() {
    defineProperties(Window.prototype, {
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
}
