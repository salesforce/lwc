/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 @license
 Copyright (c) 2015 Simon Friis Vindum.
 This code may only be used under the MIT License found at
 https://github.com/snabbdom/snabbdom/blob/master/LICENSE
 Code distributed by Snabbdom as part of the Snabbdom project at
 https://github.com/snabbdom/snabbdom/
 */

import { VM } from '../../framework/vm';

export type Key = string | number;

export type VNodes = Array<VNode | null>;

export interface VNode {
    sel: string | undefined;
    data: Readonly<VNodeData>;
    children: Readonly<VNodes> | undefined;
    elm: Node | undefined;
    parentElm?: Element;
    text: string | undefined;
    key: Key | undefined;
    hook: Hooks<any>;
    owner: VM;
}

export interface VElement extends VNode {
    sel: string;
    data: Readonly<VElementData>;
    children: Readonly<VNodes>;
    elm: Element | undefined;
    text: undefined;
    key: Key;
}

export interface VCustomElement extends VElement {
    mode: 'closed' | 'open';
    ctor: any;
    // copy of the last allocated children.
    aChildren?: Readonly<VNodes>;
}

export interface VText extends VNode {
    sel: undefined;
    children: undefined;
    elm: Node | undefined;
    text: string;
    key: undefined;
}

export interface VComment extends VNode {
    sel: undefined;
    children: undefined;
    text: string;
    key: undefined;
}

export interface VNodeData {
    // All props are readonly because VElementData may be shared across VNodes
    // due to hoisting optimizations
    readonly props?: Readonly<Record<string, any>>;
    readonly attrs?: Readonly<Record<string, string | number | boolean>>;
    readonly className?: string;
    readonly style?: string;
    readonly classMap?: Readonly<Record<string, boolean>>;
    readonly styleDecls?: Readonly<Array<[string, string, boolean]>>;
    readonly context?: Readonly<Record<string, Record<string, any>>>;
    readonly on?: Readonly<Record<string, Function>>;
    readonly svg?: boolean;
}

export interface VElementData extends VNodeData {
    readonly key: Key;
}

export interface Hooks<N extends VNode> {
    create: (vNode: N) => void;
    insert: (vNode: N, parentNode: Node, referenceNode: Node | null) => void;
    move: (vNode: N, parentNode: Node, referenceNode: Node | null) => void;
    update: (oldVNode: N, vNode: N) => void;
    remove: (vNode: N, parentNode: Node) => void;
    hydrate: (vNode: N, node: Node) => void;
}
