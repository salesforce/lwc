/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { VBaseElement } from '../../3rdparty/snabbdom/types';

function handleEvent(event: Event, vnode: VBaseElement) {
    const { type } = event;
    const {
        data: { on },
    } = vnode;
    const handler = on && on[type];
    // call event handler if exists
    if (handler) {
        handler.call(undefined, event);
    }
}

interface VNodeEventListener extends EventListener {
    vnode?: VBaseElement;
}

interface InteractiveVNode extends VBaseElement {
    listener: VNodeEventListener | undefined;
}

function createListener(): EventListener {
    return function handler(event: Event) {
        handleEvent(event, (handler as VNodeEventListener).vnode as VBaseElement);
    };
}

function updateAllEventListeners(oldVnode: InteractiveVNode, vnode: InteractiveVNode) {
    if (isUndefined(oldVnode.listener)) {
        createAllEventListeners(vnode);
    } else {
        vnode.listener = oldVnode.listener;
        vnode.listener.vnode = vnode;
    }
}

function createAllEventListeners(vnode: VBaseElement) {
    const {
        elm,
        data: { on },
        owner: { renderer },
    } = vnode;

    if (isUndefined(on)) {
        return;
    }

    const listener: VNodeEventListener = ((vnode as InteractiveVNode).listener = createListener());
    listener.vnode = vnode;

    let name;
    for (name in on) {
        renderer.addEventListener(elm, name, listener);
    }
}

export default {
    update: updateAllEventListeners,
    create: createAllEventListeners,
};
