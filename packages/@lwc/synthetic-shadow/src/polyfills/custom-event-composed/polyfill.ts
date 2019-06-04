/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { CustomEvent: OriginalCustomEvent } = window as any;

function PatchedCustomEvent(this: Event, type: string, eventInitDict: CustomEventInit<any>): Event {
    const event = new OriginalCustomEvent(type, eventInitDict);
    // support for composed on custom events
    Object.defineProperties(event, {
        composed: {
            // We can't use "value" here, because IE11 doesn't like mixing and matching
            // value with get() from Event.prototype.
            get() {
                return !!(eventInitDict && (eventInitDict as any).composed);
            },
            configurable: true,
            enumerable: true,
        },
    });
    return event;
}

(window as any).CustomEvent = PatchedCustomEvent;
(window as any).CustomEvent.prototype = OriginalCustomEvent.prototype;
