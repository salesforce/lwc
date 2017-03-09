declare class Component {
    constructor();
    render(): Node | VNode | (api: RenderAPI, cmp: Component, slotset: HashTable<Array<VNode>>) => VNode;
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderedCallback(): void;
    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void;
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
}

interface ComponentDef {
    name: string;
    props: HashTable<PropDef>;
    methods: HashTable<number>;
    observedProps: HashTable<number>;
    observedAttrs: HashTable<number>;
}

interface PlainHTMLElement extends HTMLElement {
    classList: DOMTokenList;
}

declare class VM {
    privates: HashTable<any>;
    cmpProps: HashTable<any>;
    cmpSlots: HashTable<Array<VNode>>;
    cmpEvents: HashTable<Array<EventListener>>;
    isScheduled: boolean;
    isDirty: boolean;
    wasInserted: boolean;
    def: ComponentDef;
    context: HashTable<any>;
    component: Component;
    fragment: Array<VNode>;
    listeners: Set<Set<VM>>;
}

declare class ComponentVNode extends VNode {
    Ctor: () => void;
    vm: VM;
    toString: () => string;
}

declare class VNode {
    sel: string;
    key?: number|string;
    data: Object;
    children?: Array<string|VNode>;
    text: string;
    elm?: EventTarget;
}

interface RenderAPI {
    c(tagName: string, Ctor: ObjectConstructor, data: Object): VNode;
    h(tagName: string, data: Object, children?: Array<any>, text?: string): VNode;
    i(items: Array<any>, factory: () => VNode | VNode): Array<VNode | VNode>;
    s(value: any = ''): string;
    e(): string;
    f(items: Array<any>): Array<any>;
}
