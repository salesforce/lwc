/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isNull, keys, propertyIsEnumerable } from '@lwc/shared';
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

    // The argument passed to lwc:on is frozen.
    // Because of this, `oldVnode.data.dynamicOn` is deeply equal
    // to its value from the previous render cycle.
    const oldDynamicOn =
        oldVnode?.data?.dynamicOn ?? EmptyObject;
    const newDynamicOn = dynamicOn ?? EmptyObject;

    if (oldDynamicOn === newDynamicOn) {
        return;
    }

    const { addEventListener, removeEventListener } = renderer;
    const actualEventListeners = getActualEventListeners(owner, elm!);

    const oldDynamicOnNames = keys(oldDynamicOn);
    const newDynamicOnNames = keys(newDynamicOn);

    // Remove listeners that were attached previously but don't have a corresponding listener in newDynamicOn
    for (const name of oldDynamicOnNames) {
        if (!propertyIsEnumerable.call(newDynamicOn, name)) {
            const actualListener = actualEventListeners[name];
            removeEventListener(elm, name, actualListener);
            delete actualEventListeners[name];
        }
    }

    // Ensure that the event listeners that are attached match what is present in `newDynamicOnNames`
    for (const name of newDynamicOnNames) {
        const oldHandler = propertyIsEnumerable.call(oldDynamicOn, name)
            ? oldDynamicOn[name]
            : null;
        const newHandler = newDynamicOn[name];

        if (oldHandler === newHandler) {
            continue;
        }
        if (oldHandler) {
            const actualListener = actualEventListeners[name];
            removeEventListener(elm, name, actualListener);
        }
        const actualListener = bindEventListener(owner, newHandler);
        addEventListener(elm, name, actualListener);
        actualEventListeners[name] = actualListener;
    }
}

function getActualEventListeners(vm: VM, elm: Element): Record<string, EventListener> {
    let actualEventListeners = vm.actualEventListeners.get(elm);
    if (isUndefined(actualEventListeners)) {
        actualEventListeners = {};
        vm.actualEventListeners.set(elm, actualEventListeners);
    }
    return actualEventListeners;
}

function bindEventListener(vm: VM, fn: EventListener): EventListener {
    return function (event: Event) {
        invokeEventListener(vm, fn, vm.component, event);
    };
}
