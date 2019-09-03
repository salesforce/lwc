/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assign, getHiddenField, isUndefined } from '@lwc/shared';
import { VNode } from '../../3rdparty/snabbdom/types';
import { ViewModelReflection } from '../utils';
import { VM } from '../vm';

function createContext(vnode: VNode) {
    const {
        data: { context },
    } = vnode;

    if (isUndefined(context)) {
        return;
    }

    const elm = vnode.elm as Element;
    const vm: VM = getHiddenField(elm, ViewModelReflection);

    if (!isUndefined(vm)) {
        assign(vm.context, context);
    }
}

const contextModule = {
    create: createContext,
};

export default contextModule;
