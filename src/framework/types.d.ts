declare class Component {
    constructor();

    update(): void;
    render(): VNode;
    attach(domNode: EventTarget): void;
    detach(domNode: EventTarget): void;
}

interface VM extends VNode {
    Ctor: () => void;
    component: Component,
    isReady: boolean;
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
    h(tagNAme: String, data: Object, children?: Array<any>, text?: String): VNode,
    i(items: Array<any>, factory: () => VNode | VM): Array<VNode|VM>
    m(index: Number, obj: any): any,
}

interface Namespace {}
