/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { VM } from './vm';
import type { RendererAPI } from './renderer';

export type Key = string | number;

export const enum VNodeType {
    Text,
    Comment,
    Element,
    CustomElement,
    Static,
    Fragment,
    ScopedSlotFragment,
}

export type VNode =
    | VText
    | VComment
    | VElement
    | VCustomElement
    | VStatic
    | VFragment
    | VScopedSlotFragment;

export type VNodes = Readonly<Array<VNode | null>>;

export interface BaseVParent {
    children: VNodes;
}

export interface BaseVNode {
    type: VNodeType;
    elm: Node | undefined;
    sel: string | undefined;
    key: Key | undefined;
    owner: VM;
}

export interface VScopedSlotFragment extends BaseVNode {
    factory: (value: any, key: any) => VFragment;
    type: VNodeType.ScopedSlotFragment;
    slotName: unknown;
}

export interface VStaticPart {
    readonly partId: number;
    readonly data: VStaticPartData;
    elm: Element | undefined;
}
export type VStaticPartData = Pick<VElementData, 'on' | 'ref'>;

export interface VStatic extends BaseVNode {
    readonly type: VNodeType.Static;
    readonly sel: undefined;
    readonly key: Key;
    readonly fragment: Element;
    readonly parts: VStaticPart[] | undefined;
    elm: Element | undefined;
    // Corresponds to the slot attribute of the element and indicates which `slot` element it should be assigned to
    slotAssignment: string | undefined;
}

export interface VFragment extends BaseVNode, BaseVParent {
    // In a fragment elm represents the last node of the fragment,
    // which is the end delimiter text node ([start, ...children, end]). Used in the updateStaticChildren routine.
    // elm: Node | undefined; (inherited from BaseVNode)
    sel: undefined;
    type: VNodeType.Fragment;

    // which diffing strategy to use.
    stable: 0 | 1;
    // The leading and trailing nodes are text nodes when APIFeature.USE_COMMENTS_FOR_FRAGMENT_BOOKENDS
    // is disabled and comment nodes when it is enabled.
    leading: VText | VComment;
    trailing: VText | VComment;
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
    key: 'c';
}

export interface VBaseElement extends BaseVNode, BaseVParent {
    sel: string;
    data: VElementData;
    elm: Element | undefined;
    key: Key;
    // Corresponds to the slot attribute of the element and indicates which `slot` element it should be assigned to
    slotAssignment: string | undefined;
}

export interface VElement extends VBaseElement {
    type: VNodeType.Element;
}

export interface VCustomElement extends VBaseElement {
    type: VNodeType.CustomElement;
    mode: 'closed' | 'open';
    ctor: any;
    aChildren: VNodes | undefined;
    vm: VM | undefined;
}

export interface VNodeData {
    // All props are readonly because VElementData may be shared across VNodes
    // due to hoisting optimizations
    readonly props?: Readonly<Record<string, any>>;
    readonly attrs?: Readonly<Record<string, string | number | boolean | null | undefined>>;
    readonly className?: string;
    readonly style?: string;
    readonly classMap?: Readonly<Record<string, boolean>>;
    readonly styleDecls?: Readonly<Array<[string, string, boolean]>>;
    readonly context?: Readonly<Record<string, Readonly<Record<string, any>>>>;
    readonly on?: Readonly<Record<string, (event: Event) => any>>;
    readonly svg?: boolean;
    readonly renderer?: RendererAPI;
}

export interface VElementData extends VNodeData {
    // Similar to above, all props are readonly
    readonly key: Key;
    readonly external?: boolean;
    readonly ref?: string;
    readonly slotData?: any;
    // Corresponds to the slot attribute of the element and indicates which `slot` element it should be assigned to
    readonly slotAssignment?: string;
}

export function isVBaseElement(vnode: VNode): vnode is VElement | VCustomElement {
    const { type } = vnode;
    return type === VNodeType.Element || type === VNodeType.CustomElement;
}

export function isSameVnode(vnode1: VNode, vnode2: VNode): boolean {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

export function isVCustomElement(vnode: VNode | VBaseElement): vnode is VCustomElement {
    return vnode.type === VNodeType.CustomElement;
}

export function isVFragment(vnode: VNode): vnode is VFragment {
    return vnode.type === VNodeType.Fragment;
}

export function isVScopedSlotFragment(vnode: VNode): vnode is VScopedSlotFragment {
    return vnode.type === VNodeType.ScopedSlotFragment;
}

export function isVStatic(vnode: VNode): vnode is VStatic {
    return vnode.type === VNodeType.Static;
}
