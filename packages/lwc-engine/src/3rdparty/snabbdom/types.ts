/**
@license
Copyright (c) 2015 Simon Friis Vindum.
This code may only be used under the MIT License found at
https://github.com/snabbdom/snabbdom/blob/master/LICENSE
Code distributed by Snabbdom as part of the Snabbdom project at
https://github.com/snabbdom/snabbdom/
*/

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
  uid: number;
  shadowAttribute?: string;
  fallback: boolean;
}

export interface VElement extends VNode {
  sel: string;
  children: VNodes;
  elm: Element | undefined;
  text: undefined;
  key: Key;
  fallback: boolean;
}

export interface VCustomElement extends VElement {
  mode: "closed" | "open";
  ctor: any;
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

export interface VNodeData {
  props?: Props;
  attrs?: Attrs;
  className?: any;
  style?: any;
  classMap?: Classes;
  styleMap?: VNodeStyle;
  on?: On;
  ns?: string; // for SVGs
  create: CreateHook;
  update: UpdateHook;
}

export type CreateHook = (vNode: VNode) => void;
export type InsertHook = (vNode: VNode, parentNode: Node, referenceNode: Node | null) => void;
export type UpdateHook = (oldVNode: VNode, vNode: VNode) => void;
export type RemoveHook = (vNode: VNode, parentNode: Node) => void;
export type DestroyHook = (vNode: VNode) => void;

export interface Hooks {
  create: CreateHook;
  insert: InsertHook;
  update: UpdateHook;
  remove: RemoveHook;
  destroy: DestroyHook;
}

export interface Module {
  create?: CreateHook;
  update?: UpdateHook;
  destroy?: DestroyHook;
}
