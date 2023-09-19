/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlPropertyToAttribute, isNull, isUndefined } from '@lwc/shared';
import { logWarn } from '../../shared/logger';
import { RendererAPI } from '../renderer';
import { EmptyObject } from '../utils';
import { VBaseElement } from '../vnodes';

function isLiveBindingProp(sel: string, key: string): boolean {
    // For properties with live bindings, we read values from the DOM element
    // instead of relying on internally tracked values.
    return sel === 'input' && (key === 'value' || key === 'checked');
}

export function patchProps(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI
) {
    const { props } = vnode.data;

    if (isUndefined(props)) {
        return;
    }

    let oldProps;
    if (!isNull(oldVnode)) {
        oldProps = oldVnode.data.props;
        // Props may be the same due to the static content optimization, so we can skip diffing
        if (oldProps === props) {
            return;
        }

        if (isUndefined(oldProps)) {
            oldProps = EmptyObject;
        }
    }

    const isFirstPatch = isNull(oldVnode);
    const { elm, sel } = vnode;
    const { getProperty, setProperty } = renderer;

    for (const key in props) {
        const cur = props[key];

        // Set the property if it's the first time is is patched or if the previous property is
        // different than the one previously set.
        if (
            isFirstPatch ||
            cur !== (isLiveBindingProp(sel, key) ? getProperty(elm!, key) : oldProps[key]) ||
            !(key in oldProps) // this is required because the above case will pass when `cur` is `undefined` and key is missing in `oldProps`
        ) {
            // Additional verification if properties are supported by the element
            // Validation relies on html properties and public properties being defined on the element,
            // SSR has its own custom validation.
            if (process.env.IS_BROWSER && process.env.NODE_ENV !== 'production') {
                if (!(key in elm!)) {
                    logWarn(
                        `Unknown public property "${key}" of element <${elm!.tagName.toLowerCase()}>. This is either a typo on the corresponding attribute "${htmlPropertyToAttribute(
                            key
                        )}", or the attribute does not exist in this browser or DOM implementation.`
                    );
                }
            }
            setProperty(elm!, key, cur);
        }
    }
}
