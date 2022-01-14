/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined } from '@lwc/shared';

import { getProperty, setProperty } from '../../renderer';
import { VElement } from '../../3rdparty/snabbdom/types';

import { EmptyObject } from '../utils';

function isLiveBindingProp(sel: string, key: string): boolean {
    // For properties with live bindings, we read values from the DOM element
    // instead of relying on internally tracked values.
    return sel === 'input' && (key === 'value' || key === 'checked');
}

export function patchProps(oldVnode: VElement | null, vnode: VElement) {
    const { props } = vnode.data;
    if (isUndefined(props)) {
        return;
    }

    const oldProps = isNull(oldVnode) ? EmptyObject : oldVnode.data.props;
    if (oldProps === props) {
        return;
    }

    const isFirstPatch = isNull(oldVnode);
    const { elm, sel } = vnode;

    for (const key in props) {
        const cur = props[key];

        // Set the property if it's the first time is is patched or if the previous property is
        // different than the one previously set.
        if (
            isFirstPatch ||
            cur !== (isLiveBindingProp(sel, key) ? getProperty(elm!, key) : oldProps[key])
        ) {
            setProperty(elm!, key, cur);
        }
    }
}
