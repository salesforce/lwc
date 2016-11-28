declare class Component {
    constructor();

    update(): void;
    render(): VNode;
    attach(domNode: EventTarget): void;
    detach(domNode: EventTarget): void;
}

interface HashTable<T> {
    [key: string]: T;
}

interface PropDef {
    initializer?: Function | Number | string;
    attrName: string;
}

interface AttrDef {
    propName: string;
}

interface ComponentDef {
    name: string;
    props: HashTable<PropDef>;
    attrs: HashTable<AttrDef>;
    methods: HashTable<Number>;
    observableProps: HashTable<Number>;
    observableAttrs: HashTable<Number>;
}

interface RaptorElement extends HTMLElement {}

interface VM extends VNode {
    Ctor: () => void;
    component: Component;
    flag: Object;
}

interface VNode {
    key?: number|string;
    data: Object;
    children?: Array<string|VNode>;  
    text: string;
    elm?: EventTarget;
}

interface RenderAPI {
    v(Ctor: ObjectConstructor, data: Object, children?: Array<any>): VM,
    h(tagNAme: string, data: Object, children?: Array<any>, text?: string): VNode,
    i(items: Array<any>, factory: () => VNode | VM): Array<VNode|VM>
    m(index: Number, obj: any): any,
}

interface Namespace {}
