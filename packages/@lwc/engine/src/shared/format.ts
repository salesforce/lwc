/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, ArrayJoin, ArrayPush, StringToLowerCase } from '@lwc/shared';

import { VM, UninitializedVM } from '../framework/vm';

export function getComponentTag(vm: UninitializedVM): string {
    // Element.prototype.tagName getter might be poisoned. We need to use a try/catch to protect the
    // engine internal when accessing the tagName property.
    try {
        return `<${StringToLowerCase.call(vm.elm.tagName)}>`;
    } catch (error) {
        return '<invalid-tag-name>';
    }
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
