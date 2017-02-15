declare interface HashTable<T> {
    [key: string]: T
}

declare interface PropDef {
    initializer?: Function | number | string,
    attrName: string
}

declare interface AttrDef {
    propName: string
}

declare interface ComponentDef {
    name: string,
    props: HashTable<PropDef>,
    attrs: HashTable<AttrDef>,
    methods: HashTable<number>,
    observedProps: HashTable<number>,
    observedAttrs: HashTable<number>
}

declare class PlainHTMLElement extends HTMLElement {
    classList: classList: Array<string>
}

declare interface RenderAPI {
    c(tagName: string, Ctor: ObjectConstructor, data: Object): VM,
    h(tagName: string, data: Object, children?: Array<any>, text?: string): VNode,
    i(items: Array<any>, factory: () => VNode | VM): Array<VNode | VM>,
    s(value: any = ''): string,
    e(): string,
    f(items: Array<any>): Array<any>,
}

declare interface Namespace {

}

declare class Component  {
    constructor(): this;
    render(): HTMLElement | VNode | (api: RenderAPI, cmp: Component) => VNode;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void;
    publicProps: any;
    publicMethods: Array<string>;
    templateUsedProps: Array<string>;
    observedAttributes: Array<string>
}

declare class Cache {
    privates: HashTable<any>;
    isScheduled: boolean;
    isDirty: boolean;
    def: ComponentDef;
    context: HashTable<any>;
    component: Component;
    fragment: Array<VNode>;
    listeners: Set<Set<VM>>;
}

declare class VM extends VNode {
    Ctor: () => void;
    cache: Cache;
    toString: () => string;
}

declare class VNode  {
    sel: string;
    key: number | string;
    data: Object;
    children: Array<string | VNode>;
    text: string;
    elm: EventTarget
}
