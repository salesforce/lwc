/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { VNode } from '../../3rdparty/snabbdom/types';

// The HTML style property becomes the vnode.data.styles object when defined as a string in the template.
// The compiler takes care of transforming the inline style into an object. It's faster to set the
// different style properties individually instead of via a string.
function createStyleAttribute(vnode: VNode) {
    const {
        elm,
        data: { styles },
        owner: { renderer },
    } = vnode;

    if (isUndefined(styles)) {
        return;
    }

    for (let i = 0; i < styles.length; i++) {
        const [prop, value, important] = styles[i];
        renderer.setCSSStyleProperty(elm, prop, value, !!important);
    }
}

export default {
    create: createStyleAttribute,
};
