export interface DOMAPI {
  createFragment: () => DocumentFragment;
  createElement: (tagName: string, uid: number) => HTMLElement;
  createElementNS: (namespaceURI: string, qualifiedName: string, uid: number) => Element;
  createTextNode: (text: string, uid: number) => Text;
  createComment: (text: string, uid: number) => Comment;
  insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node | null) => void;
  removeChild: (node: Node, child: Node) => void;
  appendChild: (node: Node, child: Node) => void;
  parentNode: (node: Node) => Node | null;
  nextSibling: (node: Node) => Node | null;
  setTextContent: (node: Node, text: string) => void;
}

// import {AttachData} from './helpers/attachto'
// import {VNodeStyle} from './modules/style'
export type VNodeStyle = Record<string, string> & {
  delayed?: Record<string, string>
  remove?: Record<string, string>
};
// import {On} from './modules/eventlisteners'
export type On = {
  [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void
} & {
  [event: string]: EventListener
};
// import {Attrs} from './modules/attributes'
export type Attrs = Record<string, string | number | boolean>;
// import {Classes} from './modules/class'
export type Classes = Record<string, boolean>;
// import {Props} from './modules/props'
export type Props = Record<string, any>;
// import {Dataset} from './modules/dataset'
// import {Hero} from './modules/hero'

export type Key = string | number;

export type VNodes = Array<VNode | null>;

export interface VNode {
  nt: number; // matches DOM Spec for Node's nodeType
  sel: string | undefined;
  data: VNodeData;
  children: VNodes | undefined;
  elm: Node | undefined;
  text: string | undefined;
  key: Key | undefined;
}

export interface VElement extends VNode {
  tag: string;
  sel: string;
  elm: Element | undefined;
}

export interface VFragment extends VNode {
  sel: undefined;
  elm: DocumentFragment | undefined;
}

export interface VComment extends VNode {
  sel: string;
  children: undefined;
  elm: Node | undefined;
  text: string;
}

export interface VText extends VNode {
  sel: undefined;
  children: undefined;
  elm: Node | undefined;
  text: string;
}

export interface VNodeData {
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  style?: VNodeStyle | string;
//   dataset?: Dataset;
  on?: On;
//   hero?: Hero;
//   attachData?: AttachData;
  hook?: Hooks;
  key?: Key;
  ns?: string; // for SVGs
//   fn?: () => VNode; // for thunks
//   args?: Array<any>; // for thunks
  [key: string]: any; // for any other 3rd party module
}

export type PreHook = () => void;
export type InitHook = (vNode: VNode) => void;
export type CreateHook = (emptyVNode: VNode, vNode: VNode) => void;
export type InsertHook = (vNode: VNode) => void;
export type PrePatchHook = (oldVNode: VNode, vNode: VNode) => void;
export type UpdateHook = (oldVNode: VNode, vNode: VNode) => void;
export type PostPatchHook = (oldVNode: VNode, vNode: VNode) => void;
export type DestroyHook = (vNode: VNode) => void;
export type RemoveHook = (vNode: VNode, removeCallback: () => void) => void;
export type PostHook = () => void;

export interface Hooks {
  pre?: PreHook;
  init?: InitHook;
  create?: CreateHook;
  insert?: InsertHook;
  prepatch?: PrePatchHook;
  update?: UpdateHook;
  postpatch?: PostPatchHook;
  destroy?: DestroyHook;
  remove?: RemoveHook;
  post?: PostHook;
}

export interface Module {
  pre?: PreHook;
  create?: CreateHook;
  update?: UpdateHook;
  destroy?: DestroyHook;
  remove?: RemoveHook;
  post?: PostHook;
}
