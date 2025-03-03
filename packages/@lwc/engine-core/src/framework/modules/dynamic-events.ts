/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { EmptyObject } from '../utils';
import { invokeEventListener } from '../invoker';
import type { VM } from '../vm';
import type { VBaseElement } from '../vnodes';
import type { RendererAPI } from '../renderer';

export function patchDynamicEventListeners(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI,
    owner: VM
) {
    const {
        elm,
        data: { dynamicOn },
    } = vnode;

    const oldDynamicOn = oldVnode?.data?.dynamicOn ?? EmptyObject;
    const newDynamicOn = dynamicOn ?? EmptyObject;

    // the copy api ensures that if the input is same and
    // none of its own enumerable string-keyed property is modified
    // then the copy output is same
    if (oldDynamicOn === newDynamicOn) {
        return;
    }

    const { addEventListener, removeEventListener } = renderer;
    const attachedEventListeners = getAttachedEventListeners(owner, elm!);

    // Remove listeners that were attached previously but don't have a corresponding callback in `newDynamicOn`
    for (const eventType in oldDynamicOn) {
        if (!(eventType in newDynamicOn)) {
            const attachedEventListener = attachedEventListeners[eventType];
            removeEventListener(elm, eventType, attachedEventListener);
            delete attachedEventListeners[eventType];
        }
    }

    // Ensure that the event listeners that are attached match what is present in `newDynamicOn`
    for (const eventType in newDynamicOn) {
        const oldCallback = oldDynamicOn[eventType];
        const newCallback = newDynamicOn[eventType];

        // Skip if the provided callback has not changed
        if (oldCallback === newCallback) {
            continue;
        }

        // Remove listener that was attached previously
        if (oldCallback) {
            const attachedEventListener = attachedEventListeners[eventType];
            removeEventListener(elm, eventType, attachedEventListener);
        }

        // Bind callback to owner component and add it as listener to element
        const newBoundEventListener = bindEventListener(owner, newCallback);
        addEventListener(elm, eventType, newBoundEventListener);

        // Store the newly added eventListener
        attachedEventListeners[eventType] = newBoundEventListener;
    }
}

function getAttachedEventListeners(vm: VM, elm: Element): Record<string, EventListener> {
    let attachedEventListeners = vm.attachedEventListeners.get(elm);
    if (isUndefined(attachedEventListeners)) {
        attachedEventListeners = {};
        vm.attachedEventListeners.set(elm, attachedEventListeners);
    }
    return attachedEventListeners;
}

function bindEventListener(vm: VM, fn: EventListener): EventListener {
    return function (event: Event) {
        invokeEventListener(vm, fn, vm.component, event);
    };
}
