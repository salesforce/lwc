/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined, keys } from '@lwc/shared';
import { getHiddenField } from '../../shared/fields';
import { ViewModelReflection } from '../utils';
import { prepareForPropUpdate } from '../base-bridge-element';
import { VNode } from '../../3rdparty/snabbdom/types';
import { getAttrNameFromPropName } from '../attributes';

function isLiveBindingProp(sel: string, key: string): boolean {
    // For special whitelisted properties, we check against the actual property value on the DOM element instead of
    // relying on tracked property values.
    return sel === 'input' && (key === 'value' || key === 'checked');
}

function update(oldVnode: VNode, vnode: VNode) {
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

    const elm = vnode.elm as Element;
    const vm = getHiddenField(elm, ViewModelReflection);
    const isFirstPatch = isUndefined(oldProps);
    const isCustomElement = !isUndefined(vm);
    const { sel } = vnode;

    for (const key in props) {
        const cur: any = props[key];

        if (process.env.NODE_ENV !== 'production') {
            if (!(key in elm)) {
                // TODO: #1297 - Move this validation to the compiler
                assert.fail(
                    `Unknown public property "${key}" of element <${sel}>. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(
                        key
                    )}".`
                );
            }
        }

        // if it is the first time this element is patched, or the current value is different to the previous value...
        if (
            isFirstPatch ||
            cur !== (isLiveBindingProp(sel as string, key) ? elm[key] : (oldProps as any)[key])
        ) {
            if (isCustomElement) {
                prepareForPropUpdate(vm); // this is just in case the vnode is actually a custom element
            }
            elm[key] = cur;
        }
    }
}

const emptyVNode = { data: {} };

export default {
    create: (vnode: VNode) => update(emptyVNode as VNode, vnode),
    update,
};
