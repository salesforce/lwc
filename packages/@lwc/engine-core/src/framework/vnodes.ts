/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { VM } from './vm';

export type Key = string | number;

export const enum VNodeType {
    Text,
    Comment,
    Element,
    CustomElement,
}

export type VNode = VText | VComment | VElement | VCustomElement;
export type VParentElement = VElement | VCustomElement;
export type VNodes = Array<VNode | null>;

export interface BaseVNode {
    type: VNodeType;
    elm: Node | undefined;
    // FIXME: Remove unused `sel` property on VText and VComment.
    sel: string | undefined;
    // FIXME: Remove unused `key` property on VText and VComment.
    key: Key | undefined;
    hook: Hooks<any>;
    // FIXME: Remove `owner` property on VNodes. This would enable hoisting VNodes creation outside
    // render method.
    owner: VM;
}

export interface VText extends BaseVNode {
    type: VNodeType.Text;
    sel: undefined;
    text: string;
    key: undefined;
}

export interface VComment extends BaseVNode {
    type: VNodeType.Comment;
    sel: undefined;
    text: string;
    key: undefined;
}

export interface VBaseElement extends BaseVNode {
    sel: string;
    data: VElementData;
    children: VNodes;
    elm: Element | undefined;
    key: Key;
}

export interface VElement extends VBaseElement {
    type: VNodeType.Element;
}

export interface VCustomElement extends VBaseElement {
    type: VNodeType.CustomElement;
    mode: 'closed' | 'open';
    ctor: any;
    // copy of the last allocated children.
    aChildren?: VNodes;
}

export interface VNodeData {
    props?: Record<string, any>;
    attrs?: Record<string, string | number | boolean>;
    className?: string;
    style?: string;
    classMap?: Record<string, boolean>;
    styleDecls?: Array<[string, string, boolean]>;
    context?: Record<string, Record<string, any>>;
    on?: Record<string, (event: Event) => any>;
    svg?: boolean;
}

export interface VElementData extends VNodeData {
    key: Key;
}

export interface Hooks<N extends VNode> {
    create: (vNode: N) => void;
    insert: (vNode: N, parentNode: Node, referenceNode: Node | null) => void;
    move: (vNode: N, parentNode: Node, referenceNode: Node | null) => void;
    update: (oldVNode: N, vNode: N) => void;
    remove: (vNode: N, parentNode: Node) => void;
}

export function isVBaseElement(vnode: VNode): vnode is VElement | VCustomElement {
    const { type } = vnode;
    return type === VNodeType.Element || type === VNodeType.CustomElement;
}
