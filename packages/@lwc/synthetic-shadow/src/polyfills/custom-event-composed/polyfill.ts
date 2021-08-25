/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { CustomEvent, Object, window } from '../../env/global';

function PatchedCustomEvent<T>(
    this: Event,
    type: string,
    eventInitDict: CustomEventInit<T>
): CustomEvent<T> {
    const event = new CustomEvent(type, eventInitDict);

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

PatchedCustomEvent.prototype = CustomEvent.prototype;
(window as any).CustomEvent = PatchedCustomEvent;
