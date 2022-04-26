/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isUndefined } from '@lwc/shared';
import { LightningElement } from './base-lightning-element';
import { getAssociatedVMIfPresent } from './vm';

/**
 * EXPERIMENTAL: This function provides access to the component constructor, given an HTMLElement.
 * This API is subject to change or being removed.
 */
export function getComponentConstructor(elm: HTMLElement): typeof LightningElement | null {
    let ctor: typeof LightningElement | null = null;
    // intentionally checking for undefined due to some funky libraries patching weakmap.get
    // to throw when undefined.
    if (!isUndefined(elm)) {
        const vm = getAssociatedVMIfPresent(elm);
        if (!isUndefined(vm)) {
            ctor = vm.def.ctor;
        }
    }
    return ctor;
}
