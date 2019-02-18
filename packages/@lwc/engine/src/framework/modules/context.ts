/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, assign } from '../../shared/language';
import { VNode } from '../../3rdparty/snabbdom/types';
import { ViewModelReflection } from '../utils';
import { getInternalField } from '../../shared/fields';
import { VM } from '../vm';

function createContext(vnode: VNode) {
    const {
        data: { context },
    } = vnode;

    if (isUndefined(context)) {
        return;
    }

    const elm = vnode.elm as Element;
    const vm: VM = getInternalField(elm, ViewModelReflection);

    if (!isUndefined(vm)) {
        assign(vm.context, context);
    }
}

const contextModule = {
    create: createContext,
};

export default contextModule;
