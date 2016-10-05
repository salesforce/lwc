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

interface Namespace {}
