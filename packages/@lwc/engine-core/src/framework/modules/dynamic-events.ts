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
    const actualEventListeners = getActualEventListeners(owner, elm!);

    // Remove listeners that were attached previously but don't have a corresponding listener in newDynamicOn
    for (const name in oldDynamicOn) {
        if (name in newDynamicOn) {
            const actualListener = actualEventListeners[name];
            removeEventListener(elm, name, actualListener);
            delete actualEventListeners[name];
        }
    }

    // Ensure that the event listeners that are attached match what is present in `newDynamicOnNames`
    for (const name in newDynamicOn) {
        const oldHandler = oldDynamicOn[name];
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
