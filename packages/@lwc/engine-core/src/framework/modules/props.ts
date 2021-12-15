/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isNull, isUndefined, keys } from '@lwc/shared';
import { VBaseElement } from '../../3rdparty/snabbdom/types';

function isLiveBindingProp(sel: string, key: string): boolean {
    // For properties with live bindings, we read values from the DOM element
    // instead of relying on internally tracked values.
    return sel === 'input' && (key === 'value' || key === 'checked');
}

export function patchProps(oldVnode: VBaseElement | null, vnode: VBaseElement) {
    const props = vnode.data.props;
    if (isUndefined(props)) {
        return;
    }

    const oldProps = isNull(oldVnode) ? undefined : oldVnode.data.props;
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
    const {
        elm,
        sel,
        owner: { renderer },
    } = vnode;

    for (const key in props) {
        const cur = props[key];

        // if it is the first time this element is patched, or the current value is different to the previous value...
        if (
            isFirstPatch ||
            cur !==
                (isLiveBindingProp(sel, key)
                    ? renderer.getProperty(elm!, key)
                    : (oldProps as any)[key])
        ) {
            renderer.setProperty(elm!, key, cur);
        }
    }
}
