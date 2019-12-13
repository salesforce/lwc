/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assign, isUndefined } from '@lwc/shared';
import { getAssociatedVMIfPresent } from '../vm';
import { VNode } from '../../3rdparty/snabbdom/types';

function createContext(vnode: VNode) {
    const {
        data: { context },
    } = vnode;

    if (isUndefined(context)) {
        return;
    }

    const elm = vnode.elm!;
    const vm = getAssociatedVMIfPresent(elm);

    if (!isUndefined(vm)) {
        assign(vm.context, context);
    }
}

const contextModule = {
    create: createContext,
};

export default contextModule;
