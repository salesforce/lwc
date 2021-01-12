/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties } from '@lwc/shared';
import {
    addEventListener as nativeAddEventListener,
    eventTargetPrototype,
    removeEventListener as nativeRemoveEventListener,
} from '../../env/event-target';
import {
    addCustomElementEventListener,
    removeCustomElementEventListener,
} from '../../faux-shadow/events';
import { isHostElement } from '../../faux-shadow/shadow-root';
import { getEventListenerWrapper } from '../../shared/event-target';

function patchedAddEventListener(
    this: EventTarget,
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _optionsOrCapture?: boolean | AddEventListenerOptions
) {
    const args = [...arguments];
    if (isHostElement(this)) {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return addCustomElementEventListener(this, ...args);
    }
    if (args.length > 1) {
        args[1] = getEventListenerWrapper(args[1]);
    }
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch
    return nativeAddEventListener.apply(this, args);
}

function patchedRemoveEventListener(
    this: EventTarget,
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _optionsOrCapture?: boolean | EventListenerOptions
) {
    const args = [...arguments];
    if (isHostElement(this)) {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return removeCustomElementEventListener(this, ...args);
    }
    if (arguments.length > 1) {
        args[1] = getEventListenerWrapper(args[1]);
    }
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch
    nativeRemoveEventListener.apply(this, args);
    // Account for listeners that were added before this polyfill was applied
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
