/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isUndefined, isTrue, ArraySlice } from '@lwc/shared';
import { windowRemoveEventListener, windowAddEventListener } from '../../env/window';
import { eventTargetGetter } from '../../env/dom';
import { isNodeShadowed } from '../../shared/node-ownership';

// this method returns true if an event can be seen by a particular eventTarget,
// otherwise it returns false, which means the listener will never be invoked.
function isQualifyingEventTarget(currentTarget: Window, evt: Event): boolean {
    const originalTarget = eventTargetGetter.call(evt);
    if (originalTarget === currentTarget) {
        // dispatched on the window directly
        return true;
    }
    const { composed } = evt;
    // if the event reaches the window by propagation, it is because it is bubbling,
    // in which the the only it really depends on the composed value
    return isTrue(composed) || !isNodeShadowed(originalTarget as Node);
}

const EventListenerToWrapperMap: WeakMap<
    EventListenerOrEventListenerObject,
    EventListener
> = new WeakMap();

function getEventListenerWrapper(fnOrObj: EventListenerOrEventListenerObject): EventListener {
    let wrapperFn: EventListener | undefined = EventListenerToWrapperMap.get(fnOrObj);
    if (isUndefined(wrapperFn)) {
        wrapperFn = function(this: Window, e: Event) {
            if (isQualifyingEventTarget(this, e)) {
                if (typeof fnOrObj === 'function') {
                    fnOrObj.call(this, e);
                } else {
                    fnOrObj.handleEvent && fnOrObj.handleEvent(e);
                }
            }
        };
        EventListenerToWrapperMap.set(fnOrObj, wrapperFn);
    }
    return wrapperFn;
}

function addEventListenerPatched(
    this: Window,
    _type: string,
    listener: EventListenerOrEventListenerObject | null,
    _options?: boolean | AddEventListenerOptions
) {
    if (listener == null) {
        return; /* nullish */
    }
    const args = ArraySlice.call(arguments);
    args[1] = getEventListenerWrapper(listener);
    windowAddEventListener.apply(this, args as [
        string,
        EventListener,
        (EventListenerOptions | boolean | undefined)?
    ]);
}

function removeEventListenerPatched(
    this: Window,
    _type: string,
    listener: EventListenerOrEventListenerObject | null,
    _options?: EventListenerOptions | boolean
) {
    if (listener == null) {
        return; /* nullish */
    }
    const args = ArraySlice.call(arguments);
    args[1] = getEventListenerWrapper(listener);
    windowRemoveEventListener.apply(this, args as [
        string,
        EventListener,
        (EventListenerOptions | boolean | undefined)?
    ]);
}

export default function apply() {
    defineProperties(Window.prototype, {
        addEventListener: {
            value: addEventListenerPatched,
            enumerable: true,
            writable: true,
            configurable: true,
        },
        removeEventListener: {
            value: removeEventListenerPatched,
            enumerable: true,
            writable: true,
            configurable: true,
        },
    });
}
