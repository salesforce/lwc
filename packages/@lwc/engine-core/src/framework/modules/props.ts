/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined, keys } from '@lwc/shared';
import { setProperty, getProperty } from '../../renderer';
import { VElement } from '../../3rdparty/snabbdom/types';

function isLiveBindingProp(sel: string, key: string): boolean {
    // For properties with live bindings, we read values from the DOM element
    // instead of relying on internally tracked values.
    return sel === 'input' && (key === 'value' || key === 'checked');
}

function update(oldVnode: VElement, vnode: VElement) {
    const props = vnode.data.props;

    if (isUndefined(props)) {
        return;
    }
    const oldProps = oldVnode.data.props;
    if (oldProps === props) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isUndefined(oldProps) || keys(oldProps).join(',') === keys(props).join(','),
            'vnode.data.props cannot change shape.'
        );
    }

    const isFirstPatch = isUndefined(oldProps);
    const { elm, sel } = vnode;

    for (const key in props) {
        const cur = props[key];

        // if it is the first time this element is patched, or the current value is different to the previous value...
        if (
            isFirstPatch ||
            cur !== (isLiveBindingProp(sel, key) ? getProperty(elm!, key) : (oldProps as any)[key])
        ) {
            setProperty(elm!, key, cur);
        }
    }
}

const emptyVNode = { data: {} } as VElement;

export default {
    create: (vnode: VElement) => update(emptyVNode, vnode),
    update,
};
