/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isUndefined } from '@lwc/shared';

import { getAssociatedVMIfPresent, LightningElement } from '../../../src';

/**
 * EXPERIMENTAL: This function provides access to the component constructor, given an HTMLElement.
 * This API is subject to change or being removed.
 */
export function getComponentConstructor(elm: HTMLElement): typeof LightningElement | null {
    let ctor: typeof LightningElement | null = null;

    if (elm instanceof HTMLElement) {
        const vm = getAssociatedVMIfPresent(elm);

        if (!isUndefined(vm)) {
            ctor = vm.def.ctor;
        }
    }

    return ctor;
}
