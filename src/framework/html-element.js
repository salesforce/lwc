import assert from "./assert.js";
import { getLinkedVNode } from "./vm.js";
import { ClassList } from "./class-list.js";
import {
    defineProperty,
} from "./language.js";

const HTMLElementPropsTheGoodParts = [
    "tagName",
];
const HTMLElementMethodsTheGoodParts = [
    "querySelector",
    "querySelectorAll",
    "addEventListener",
];

class PlainHTMLElement {
    constructor() {
        Object.defineProperties(this, {
            classList: {
                value:  new ClassList(this),
                writable: false,
                configurable: false,
                enumerable: true,
            },
            // TODO: add dataset
        });
    }
    dispatchEvent(event: Event): boolean {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { elm } = vnode;
        // custom elements will rely on the DOM dispatchEvent mechanism
        assert.isTrue(elm instanceof HTMLElement, `Invalid association between component ${this} and element ${elm}.`);
        return elm.dispatchEvent(event);
    }
}

// One time operation to expose the good parts of the web component API,
// in terms of methods and properties:
HTMLElementMethodsTheGoodParts.reduce((proto: any, methodName: string): any => {
    proto[methodName] = function (...args: Array<any>): any {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { elm } = vnode;
        assert.isTrue(elm instanceof HTMLElement, `Invalid association between component ${this} and element ${elm} when calling method ${methodName}.`);
        return elm[methodName](...args);
    };
    return proto;
}, PlainHTMLElement.prototype);

HTMLElementPropsTheGoodParts.reduce((proto: any, propName: string): any => {
    defineProperty(proto, propName, {
        get: function (): any {
            const element = getLinkedVNode(this);
            assert.isTrue(element instanceof HTMLElement, `Invalid association between component ${this} and element ${element} when accessing member property @{propName}.`);
            return element[propName];
        },
        enumerable: true,
        configurable: false,
    });
    return proto;
}, PlainHTMLElement.prototype);

export { PlainHTMLElement as HTMLElement };
