/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isUndefined } from '@lwc/shared';
import {
    addCustomElementEventListener,
    removeCustomElementEventListener,
} from '../../faux-shadow/events';
import {
    isHostElement,
    getHost,
    SyntheticShadowRootInterface,
} from '../../faux-shadow/shadow-root';
import { eventTargetGetter } from '../../env/dom';
import { isNodeShadowed } from '../../shared/node-ownership';
import { contains } from '../../env/node';

// this method returns true if an event can be seen by a particular eventTarget,
// otherwise it returns false, which means the listener will never be invoked.
function isQualifyingEventTarget(currentTarget: EventTarget, evt: Event): boolean {
    const { composed, bubbles } = evt;
    if (!composed) {
        const originalTarget = eventTargetGetter.call(evt);
        if (bubbles) {
            // bubbles true, composed false: only propagate up to the originalTarget's shadowRoot
            if (originalTarget instanceof Node) {
                if (isNodeShadowed(originalTarget)) {
                    // if the original target is shadowed, every hub in the path to its shadowRoot
                    // will have visibility into the event, including slots since the target might
                    // be slotted.
                    const sr = originalTarget.getRootNode() as SyntheticShadowRootInterface;
                    return contains.call(getHost(sr), currentTarget as Node);
                }
                // else it is a global node or document
            }
            // else it is window
        } else {
            // bubbles false, composed false: only dispatch it on the original target
            return currentTarget === originalTarget;
        }
    } else if (!bubbles) {
        // bubble false, composed true: only propagate via host elements
        return isHostElement(currentTarget as Node);
    }
    // bubbles true, composed true
    return true;
}

function getEventListenerWrapper(fnOrObj: EventListenerOrEventListenerObject): EventListener {
    let wrapperFn: EventListener | undefined = (fnOrObj as any).$$lwcEventWrapper$$;
    if (isUndefined(wrapperFn)) {
        wrapperFn = (fnOrObj as any).$$lwcEventWrapper$$ = function(this: EventTarget, e: Event) {
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

// These methods are usually from EventTarget.prototype, but that's not available in IE11, the next best thing
// is Node.prototype, which is an EventTarget as well.
const {
    addEventListener: superAddEventListener,
    removeEventListener: superRemoveEventListener,
} = Node.prototype;

function addEventListenerPatched(
    this: Element,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
) {
    if (listener == null) {
        return; /* nullish */
    }
    const wrapperFn = getEventListenerWrapper(listener);
    if (isHostElement(this)) {
        addCustomElementEventListener(this, type, wrapperFn, options);
    } else {
        superAddEventListener.call(this, type, wrapperFn, options);
    }
}

function removeEventListenerPatched(
    this: Element,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
) {
    if (listener == null) {
        return; /* nullish */
    }
    const wrapperFn = getEventListenerWrapper(listener);
    if (isHostElement(this)) {
        removeCustomElementEventListener(this, type, wrapperFn, options);
    } else {
        superRemoveEventListener.call(this, type, wrapperFn, options);
    }
}

// IE11 doesn't have EventTarget, so we have to patch it conditionally
// on the wrong prototypes.
const protoToBePatched =
    typeof EventTarget !== 'undefined' ? EventTarget.prototype : Node.prototype;

defineProperties(protoToBePatched, {
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
