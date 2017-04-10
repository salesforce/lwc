declare class Component {
    constructor(): this;
    render(): Node | VNode | (api: RenderAPI, cmp: Component, slotset: HashTable<Array<VNode>>) => VNode;
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderedCallback(): void;
    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void;
    publicProps: any;
    publicMethods: Array<string>;
    templateUsedProps: Array<string>;
    observedAttributes: Array<string>
}

declare interface HashTable<T> {
    [key: string]: T,
}

declare interface PropDef {}

declare interface ComponentDef {
    name: string,
    isStateful: boolean,
    props: HashTable<PropDef>,
    methods: HashTable<number>,
    observedAttrs: HashTable<number>,
}

declare class ComponentElement extends Component {
    classList: DOMTokenList;
}

declare class VM {
    cmpState: HashTable<any>;
    cmpProps: HashTable<any>;
    cmpSlots: HashTable<Array<VNode>>;
    cmpEvents: HashTable<Array<EventListener>>;
    cmpClasses: HashTable<Boolean>;
    isScheduled: boolean;
    isDirty: boolean;
    wasInserted: boolean;
    def: ComponentDef;
    context: HashTable<any>;
    component: Component;
    fragment: Array<VNode>;
    deps: Array<Array<VM>>;
    classListObj: DOMTokenList,
    toString(): string;
}

declare class ComponentVNode extends VNode {
    Ctor: Class<Component>;
    vm: VM;
    toString: () => string;
}

export type PreHook = () => any;
export type InitHook = (vNode: VNode) => any;
export type CreateHook = (emptyVNode: VNode, vNode: VNode) => any;
export type InsertHook = (vNode: VNode) => any;
export type PrePatchHook = (oldVNode: VNode, vNode: VNode) => any;
export type UpdateHook = (oldVNode: VNode, vNode: VNode) => any;
export type PostPatchHook = (oldVNode: VNode, vNode: VNode) => any;
export type DestroyHook = (vNode: VNode) => any;
export type RemoveHook = (vNode: VNode, removeCallback: () => void) => any;
export type PostHook = () => any;

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

export interface VNodeData {
    props?: any;
    attrs?: any;
    className?: string;
    classMap?: HashTable<string>;
    style?: any;
    on?: HashTable<EventListener>;
    hook?: Hooks;
    key?: number | string;
    ns?: string; // for SVGs
    [key: string]: any; // for any other 3rd party module
}

declare class VNode  {
    sel: string | undefined;
    data: VNodeData | undefined;
    children: Array<VNode | string> | undefined;
    elm: Node | undefined;
    text: string | undefined;
    key: number | string;
}

declare interface RenderAPI {
    c(tagName: string, Ctor: Class<Component>, data: Object): VNode,
    h(tagName: string, data: Object, children: Array<any>): VNode,
    v(tagName: string, data: VNodeData, children?: Array<any>, text?: string, elm?: Element | Text, Ctor?: Class<Component>): VNode,
    i(items: Array<any>, factory: () => VNode | VNode): Array<VNode>,
    n(children: Array<VNode|null|number|string|Node>): Array<VNode>,
    f(items: Array<any>): Array<any>,
}

export type ServiceCallback = (component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>) => void;

export interface Services {
  connected?: ServiceCallback;
  disconnected?: ServiceCallback;
  rehydrated?: ServiceCallback;
}
