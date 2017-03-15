import assert from "./assert.js";
import { scheduleRehydration, getLinkedVNode } from "./vm.js";
import { ClassList } from "./class-list.js";
import { addComponentEventListener, removeComponentEventListener } from "./component.js";
import {
    defineProperty,
} from "./language.js";

const HTMLElementPropsTheGoodParts = [
    "tagName",
];
const HTMLElementMethodsTheGoodParts = [
    "querySelector",
    "querySelectorAll",
    "getBoundingClientRect",
];

class ComponentElement {
    constructor() {
        const classList = new ClassList(this);
        Object.defineProperties(this, {
            classList: {
                value: classList,
                writable: false,
                configurable: false,
                enumerable: true,
            },
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

    addEventListener(type: string, listener: EventListener) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        assert.block(() => {
            if (arguments.length > 2) {
                console.error(`this.addEventListener() on component ${vm} does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        addComponentEventListener(vm, type, listener);
        if (vm.isDirty) {
            console.log(`Scheduling ${vm} for rehydration due to the addition of an event listener for ${type}.`);
            scheduleRehydration(vm);
        }
    }

    removeEventListener(type: string, listener: EventListener) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        assert.block(() => {
            if (arguments.length > 2) {
                console.error(`this.removeEventListener() on component ${vm} does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        removeComponentEventListener(vm, type, listener);
        if (vm.isDirty) {
            console.log(`Scheduling ${vm} for rehydration due to the removal of an event listener for ${type}.`);
            scheduleRehydration(vm);
        }
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
}, ComponentElement.prototype);

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
}, ComponentElement.prototype);

export { ComponentElement as Element };
