/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const CustomEventConstructor = CustomEvent;

function PatchedCustomEvent<T>(
    this: Event,
    type: string,
    eventInitDict: CustomEventInit<T>
): CustomEvent<T> {
    const event = new CustomEventConstructor(type, eventInitDict);

    const isComposed = !!(eventInitDict && eventInitDict.composed);
    Object.defineProperties(event, {
        composed: {
            get() {
                return isComposed;
            },
            configurable: true,
            enumerable: true,
        },
    });

    return event;
}

PatchedCustomEvent.prototype = CustomEventConstructor.prototype;
(window as any).CustomEvent = PatchedCustomEvent;
