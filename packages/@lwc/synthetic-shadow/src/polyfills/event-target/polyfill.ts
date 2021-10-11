/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArraySlice, defineProperties } from '@lwc/shared';
import {
    addEventListener as nativeAddEventListener,
    eventTargetPrototype,
    removeEventListener as nativeRemoveEventListener,
} from '../../env/event-target';
import {
    addCustomElementEventListener,
    removeCustomElementEventListener,
} from '../../faux-shadow/events';
import { isSyntheticShadowHost } from '../../faux-shadow/shadow-root';
import { getEventListenerWrapper } from '../../shared/event-target';

function patchedAddEventListener(
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    optionsOrCapture?: boolean | AddEventListenerOptions
) {
    if (isSyntheticShadowHost(this)) {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return addCustomElementEventListener.apply(this, arguments);
    }
    if (arguments.length < 2) {
        // Slow path, unlikely to be called frequently. We expect modern browsers to throw:
        // https://googlechrome.github.io/samples/event-listeners-mandatory-arguments/
        const args = ArraySlice.call(arguments);
        if (args.length > 1) {
            args[1] = getEventListenerWrapper(args[1]);
        }
        // Ignore types because we're passing through to native method
        // @ts-ignore type-mismatch
        return nativeAddEventListener.apply(this, args);
    }
    // Fast path. This function is optimized to avoid ArraySlice because addEventListener is called
    // very frequently, and it provides a measurable perf boost to avoid so much array cloning.

    const wrappedListener = getEventListenerWrapper(listener) as EventListenerOrEventListenerObject;
    // The third argument is optional, so passing in `undefined` for `optionsOrCapture` gives capture=false
    return nativeAddEventListener.call(this, type, wrappedListener, optionsOrCapture);
}

function patchedRemoveEventListener(
    this: EventTarget,
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _optionsOrCapture?: boolean | EventListenerOptions
) {
    if (isSyntheticShadowHost(this)) {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return removeCustomElementEventListener.apply(this, arguments);
    }
    const args = ArraySlice.call(arguments);
    if (arguments.length > 1) {
        args[1] = getEventListenerWrapper(args[1]);
    }
    // Ignore types because we're passing through to native method
    // @ts-ignore type-mismatch
    nativeRemoveEventListener.apply(this, args);
    // Account for listeners that were added before this polyfill was applied
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch
    nativeRemoveEventListener.apply(this, arguments);
}

defineProperties(eventTargetPrototype, {
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
