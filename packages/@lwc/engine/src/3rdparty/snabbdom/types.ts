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

export type VNodeStyle = Record<string, string>;
export interface On {
    [event: string]: EventListener;
}
export type Attrs = Record<string, string | number | boolean>;
export type Classes = Record<string, boolean>;
export type Props = Record<string, any>;

export type Key = string | number;

export type VNodes = Array<VNode | null>;

export interface VNode {
    sel: string | undefined;
    data: VNodeData;
    children: VNodes | undefined;
    elm: Node | undefined;
    parentElm?: Element;
    text: string | undefined;
    key: Key | undefined;

    hook: Hooks;
    owner: VM;
}

export interface VElement extends VNode {
    sel: string;
    children: VNodes;
    elm: Element | undefined;
    text: undefined;
    key: Key;
    // TODO: issue #1364 - support the ability to provision a cloned StyleElement
    // for native shadow as a perf optimization
    clonedElement?: HTMLStyleElement;
}

export interface VCustomElement extends VElement {
    mode: 'closed' | 'open';
    ctor: any;
    clonedElement?: undefined;
}

export interface VComment extends VNode {
    sel: string;
    children: undefined;
    elm: Comment | undefined;
    text: string;
    key: undefined;
}

export interface VText extends VNode {
    sel: undefined;
    children: undefined;
    elm: Node | undefined;
    text: string;
    key: undefined;
}

export type CustomElementContext = Record<string, Record<string, any>>;

export interface VNodeData {
    props?: Props;
    attrs?: Attrs;
    className?: any;
    style?: any;
    classMap?: Classes;
    styleMap?: VNodeStyle;
    context?: CustomElementContext;
    on?: On;
    ns?: string; // for SVGs
    validateFn?: () => void;
}

export type CreateHook = (vNode: VNode) => void;
export type InsertHook = (vNode: VNode, parentNode: Node, referenceNode: Node | null) => void;
export type MoveHook = (vNode: VNode, parentNode: Node, referenceNode: Node | null) => void;
export type UpdateHook = (oldVNode: VNode, vNode: VNode) => void;
export type RemoveHook = (vNode: VNode, parentNode: Node) => void;

export interface Hooks {
    create: CreateHook;
    insert: InsertHook;
    move: MoveHook;
    update: UpdateHook;
    remove: RemoveHook;
}

export interface Module {
    create?: CreateHook;
    update?: UpdateHook;
}
