type Template = (api: RenderAPI, cmp: Component, slotset: HashTable<Array<VNode>>) => undefined | Array<VNode>;

declare class Component {
    render(): void | Template;
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderedCallback(): void;
    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void;
    publicProps: any;
    publicMethods: Array<string>;
    templateUsedProps: Array<string>;
    observedAttributes: Array<string>;
    labels: Array<string>;
}

declare interface HashTable<T> {
    [key: string]: T,
}

declare interface PropDef {}

declare interface ComponentDef {
    name: string,
    props: HashTable<PropDef>,
    methods: HashTable<number>,
    observedAttrs: HashTable<number>,
}

declare class ComponentElement extends Component {
    classList: DOMTokenList;
}

declare class VM {
    uid: number;
    idx: number;
    cmpState?: HashTable<any>;
    cmpProps: HashTable<any>;
    cmpSlots?: HashTable<Array<VNode>>;
    cmpEvents?: HashTable<Array<EventListener>>;
    cmpListener?: (event: Event) => void;
    cmpClasses?: HashTable<Boolean>;
    cmpTemplate?: any;
    cmpRoot?: ShadowRoot;
    isScheduled: boolean;
    isDirty: boolean;
    def: ComponentDef;
    context: HashTable<any>;
    component?: Component;
    vnode?: VNode;
    fragment: Array<VNode>;
    deps: Array<Array<VM>>;
    classListObj?: DOMTokenList;
    toString(): string;
}

declare class ComponentVNode extends VNode {
    Ctor: ObjectConstructor;
    vm: VM;
    toString: () => string;
}

type PreHook = () => any;
type InitHook = (vNode: VNode) => any;
type CreateHook = (emptyVNode: VNode, vNode: VNode) => any;
type InsertHook = (vNode: VNode) => any;
type PrePatchHook = (oldVNode: VNode, vNode: VNode) => any;
type UpdateHook = (oldVNode: VNode, vNode: VNode) => any;
type PostPatchHook = (oldVNode: VNode, vNode: VNode) => any;
type DestroyHook = (vNode: VNode) => any;
type RemoveHook = (vNode: VNode, removeCallback: () => void) => any;
type PostHook = () => any;

interface Hooks {
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

interface VNodeData {
    props?: any;
    attrs?: any;
    className?: string;
    classMap?: HashTable<string>;
    class?: HashTable<string>;
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
    uid: number;
}

declare interface RenderAPI {
    c(tagName: string, Ctor: ObjectConstructor, data: Object): VNode,
    h(tagName: string, data: Object, children: Array<any>): VNode,
    v(tagName: string, data: VNodeData, children?: Array<any>, text?: string, elm?: Element | Text, Ctor?: ObjectConstructor): VNode,
    i(items: Array<any>, factory: () => VNode | VNode): Array<VNode>,
    n(children: Array<VNode|null|number|string|Node>): Array<VNode>,
    f(items: Array<any>): Array<any>,
    b(fn: EventListener): EventListener,
}

type ServiceCallback = (component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>) => void;

interface Services {
  connected?: ServiceCallback;
  disconnected?: ServiceCallback;
  rehydrated?: ServiceCallback;
}
