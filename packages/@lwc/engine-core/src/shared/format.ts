/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull } from '@lwc/shared';

import type { VM } from '../framework/vm';

export function getComponentTag(vm: VM): string {
    return `<${vm.tagName.toLowerCase()}>`;
}

// TODO [#1695]: Unify getComponentStack and getErrorComponentStack
export function getComponentStack(vm: VM): string {
    const stack: string[] = [];
    let prefix = '';

    while (!isNull(vm.owner)) {
        stack.push(prefix + getComponentTag(vm));

        vm = vm.owner;
        prefix += '\t';
    }

    return stack.join('\n');
}

export function getErrorComponentStack(vm: VM): string {
    const wcStack: string[] = [];

    let currentVm: VM | null = vm;
    while (!isNull(currentVm)) {
        wcStack.push(getComponentTag(currentVm));
        currentVm = currentVm.owner;
    }

    return wcStack.reverse().join('\n\t');
}
