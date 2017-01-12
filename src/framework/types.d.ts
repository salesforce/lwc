declare class Component {
    constructor();
    render(api: RenderAPI): HTMLElement | VNode;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void;
    static tagName: string;
    static publicProps: any;
    static publicMethods: Array<string>;
    static templateUsedProps: Array<string>;
    static observedAttributes: Array<string>;
}

interface HashTable<T> {
    [key: string]: T;
}

interface PropDef {
    initializer?: Function | number | string;
    attrName: string;
}

interface AttrDef {
    propName: string;
}

interface ComponentDef {
    name: string;
    props: HashTable<PropDef>;
    attrs: HashTable<AttrDef>;
    methods: HashTable<number>;
    observedProps: HashTable<number>;
    observedAttrs: HashTable<number>;
}

interface RaptorElement extends HTMLElement {}

interface VMFlags {
    hasBodyAttribute: boolean;
    isScheduled: boolean;
    isDirty: boolean;
    hasElement: boolean;
}

declare class VM extends VNode {
    Ctor: () => void;
    state: HashTable<any>;
    body: Array<VNode>;
    flags: VMFlags;
    def: ComponentDef;
    context: HashTable<any>;
    component: Component;
    vnode: VNode;
    listeners: Set<Set<VM>>;
    toString: () => string;
}

declare class VNode {
    sel: string;
    key?: number|string;
    data: Object;
    children?: Array<string|VNode>;  
    text: string;
    elm?: EventTarget;
    listener: (event: Event) => void;
}

interface RenderAPI {
    v(Ctor: ObjectConstructor, data: Object, children?: Array<any>): VM;
    h(tagNAme: string, data: Object, children?: Array<any>, text?: string): VNode;
    i(items: Array<any>, factory: () => VNode | VM): Array<VNode|VM>;
    m(index: number, obj: any): any;
}

interface Namespace {}
