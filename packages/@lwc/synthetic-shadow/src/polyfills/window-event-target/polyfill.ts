/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties } from '@lwc/shared';

import { windowAddEventListener, windowRemoveEventListener } from '../../env/window';
import { getEventListenerWrapper } from '../../shared/event-target';

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
