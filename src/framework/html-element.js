import assert from "./assert.js";
import { getLinkedVNode } from "./component.js";
import { vmBeingCreated } from "./invoker.js";
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
        assert.vm(vmBeingCreated, `Invalid creation patch for ${this} who extends HTMLElement. It expects a vm, instead received ${vmBeingCreated}.`);
        Object.defineProperties(this, {
            classList: {
                value:  new ClassList(vmBeingCreated),
                writable: false,
                configurable: false,
                enumerable: true,
            },
            // TODO: add dataset
        });
    }
    dispatchEvent(event: Event): boolean {
        const vm = getLinkedVNode(this);
        assert.vm(vm);
        const { elm } = vm;
        // custom elements will rely on the DOM dispatchEvent mechanism
        assert.isTrue(elm instanceof HTMLElement, `Invalid association between component ${this} and element ${elm}.`);
        return elm.dispatchEvent(event);
    }
}

// One time operation to expose the good parts of the web component API,
// in terms of methods and properties:
HTMLElementMethodsTheGoodParts.reduce((proto: any, methodName: string): any => {
    proto[methodName] = function (...args: Array<any>): any {
        const vm = getLinkedVNode(this);
        assert.vm(vm);
        const { elm } = vm;
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
