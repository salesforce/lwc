/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { windowRemoveEventListener, windowAddEventListener } from '../../env/window';

import { defineProperties, isUndefined, isTrue, ArraySlice } from '@lwc/shared';
import { eventTargetGetter } from '../../env/dom';
import { isNodeShadowed } from '../../shared/node-ownership';

// this method returns true if an event can be seen by a particular eventTarget,
// otherwise it returns false, which means the listener will never be invoked.
function isQualifyingEventTarget(currentTarget: Window, evt: Event): boolean {
    const { composed } = evt;
    const originalTarget = eventTargetGetter.call(evt);
    if (originalTarget === currentTarget) {
        // dispatched on the window directly
        return true;
    }
    // if the event reaches the window by propagation is because it is bubbling,
    // in which the the only it really depends on the composed value
    return isTrue(composed) || !isNodeShadowed(originalTarget as Node);
}

function getEventListenerWrapper(fnOrObj: EventListenerOrEventListenerObject): EventListener {
    let wrapperFn: EventListener | undefined = (fnOrObj as any).$$lwcEventWrapper$$;
    if (isUndefined(wrapperFn)) {
        wrapperFn = (fnOrObj as any).$$lwcEventWrapper$$ = function(this: Window, e: Event) {
            if (isQualifyingEventTarget(this, e)) {
                if (typeof fnOrObj === 'function') {
                    fnOrObj.call(this, e);
                } else {
                    fnOrObj.handleEvent && fnOrObj.handleEvent(e);
                }
            }
        };
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
