/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isTrue, isNull, ArrayJoin, ArrayPush, StringToLowerCase } from '@lwc/shared';

import { VM, UninitializedVM } from '../framework/vm';

export function getComponentTag(vm: UninitializedVM, withIndex = false): string {
    // Note: Element.prototype.tagName getter might be poisoned but we should be fine in this case
    // the getTagName function is only used for debugging purposes.
    const tagName = StringToLowerCase.call(vm.elm.tagName);
    return isTrue(withIndex) ? `<${tagName} (${vm.idx})>` : `<${tagName}>`;
}

export function getComponentStack(vm: VM): string {
    const stack: string[] = [];
    let prefix = '';

    while (!isNull(vm.owner)) {
        ArrayPush.call(stack, prefix + getComponentTag(vm));

        vm = vm.owner;
        prefix += '\t';
    }

    return ArrayJoin.call(stack, '\n');
}
