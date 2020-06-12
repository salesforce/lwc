/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, ArrayJoin, ArrayPush, StringToLowerCase } from '@lwc/shared';

import { VM } from '../framework/vm';

export function getComponentTag(vm: VM): string {
    return `<${StringToLowerCase.call(vm.tagName)}>`;
}

// TODO [#1695]: Unify getComponentStack and getErrorComponentStack
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

export function getErrorComponentStack(vm: VM): string {
    const wcStack: string[] = [];

    let currentVm: VM | null = vm;
    while (!isNull(currentVm)) {
        ArrayPush.call(wcStack, getComponentTag(currentVm));
        currentVm = currentVm.owner;
    }

    return wcStack.reverse().join('\n\t');
}
