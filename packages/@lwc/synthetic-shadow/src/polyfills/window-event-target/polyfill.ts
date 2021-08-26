/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArraySlice, defineProperties } from '@lwc/shared';

import { windowAddEventListener, windowRemoveEventListener } from '../../env/window';
import { getEventListenerWrapper } from '../../shared/event-target';

function patchedAddEventListener(
    this: Window,
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
) {
    if (arguments.length > 1) {
        const args = ArraySlice.call(arguments);
        args[1] = getEventListenerWrapper(args[1]);

        // Ignore types because we're passing through to native method
        // @ts-ignore type-mismatch
        return windowAddEventListener.apply(this, args);
    }

    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch
    return windowAddEventListener.apply(this, arguments);
}

function patchedRemoveEventListener(
    this: Window,
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | EventListenerOptions
) {
    if (arguments.length > 1) {
        const args = ArraySlice.call(arguments);
        args[1] = getEventListenerWrapper(args[1]);

        // Ignore types because we're passing through to native method
        // @ts-ignore type-mismatch
        windowRemoveEventListener.apply(this, args);
    }

    // Account for listeners that were added before this polyfill was applied
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch
    windowRemoveEventListener.apply(this, arguments);
}

export default function apply() {
    defineProperties(Window.prototype, {
        addEventListener: {
            value: patchedAddEventListener,
            enumerable: true,
            writable: true,
            configurable: true,
        },
        removeEventListener: {
            value: patchedRemoveEventListener,
            enumerable: true,
            writable: true,
            configurable: true,
        },
    });
}
