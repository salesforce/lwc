declare interface HashTable<T> {
    [key: string]: T
}

declare interface PropDef {
    initializer?: Function | Number | string,
    attrName: string
}

declare interface AttrDef {
    propName: string
}

declare interface ComponentDef {
    name: string,
    props: HashTable<PropDef>,
    attrs: HashTable<AttrDef>,
    methods: HashTable<Number>,
    observableProps: HashTable<Number>,
    observableAttrs: HashTable<Number>
}

declare interface RaptorElement {
    
}

declare interface VM {
    Ctor: () => void,
    component: Component,
    flag: Object
}

declare interface VNode {
    key?: number | string,
    data: Object,
    children?: Array<string | VNode>,
    text: string,
    elm?: EventTarget
}

declare interface RenderAPI {
    v(Ctor: ObjectConstructor, data: Object, children?: Array<any>): VM,
    h(tagNAme: string, data: Object, children?: Array<any>, text?: string): VNode,
    i(items: Array<any>, factory: () => VNode | VM): Array<VNode | VM>,
    m(index: Number, obj: any): any
}

declare interface Namespace {
    
}

declare class Component  {
    constructor(): this;
    render(): VNode;
    attach(): void;
    detach(): void
}
