/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { VNode } from '../../3rdparty/snabbdom/types';

// The HTML class property becomes the vnode.data.classMap object when defined as a string in the template.
// The compiler takes care of transforming the inline classnames into an object. It's faster to set the
// different classnames properties individually instead of via a string.
function createClassAttribute(vnode: VNode) {
    const {
        elm,
        data: { classMap },
        owner: { renderer },
    } = vnode;

    if (isUndefined(classMap)) {
        return;
    }

    const classList = renderer.getClassList(elm);
    for (const name in classMap) {
        classList.add(name);
    }
}

export default {
    create: createClassAttribute,
};
