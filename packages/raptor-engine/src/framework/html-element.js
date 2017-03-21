import assert from "./assert.js";
import { scheduleRehydration, getLinkedVNode } from "./vm.js";
import { ClassList } from "./class-list.js";
import { addComponentEventListener, removeComponentEventListener } from "./component.js";

function getLinkedElement(cmp): HTMLElement {
    const vnode = getLinkedVNode(cmp);
    assert.vnode(vnode);
    const { elm } = vnode;
    assert.isTrue(elm instanceof HTMLElement, `Invalid association between component ${cmp} and element ${elm}.`);
    return elm;
}

function ComponentElement(): ComponentElement {
    // This should always be empty, and any initialization should be done lazily
}

ComponentElement.prototype = {
    dispatchEvent(event: Event): boolean {
        const elm = getLinkedElement(this);
        // custom elements will rely on the DOM dispatchEvent mechanism
        return elm.dispatchEvent(event);
    },
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
    },
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
    },
    getBoundingClientRect(): DOMRect {
        const elm = getLinkedElement(this);
        return elm.getBoundingClientRect();
    },
    querySelector(selectors: string): Element {
        const elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        return elm.querySelector(selectors);
    },
    querySelectorAll(selectors: string): NodeList {
        const elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        return elm.querySelectorAll(selectors);
    },
    get tagName(): string {
        const element = getLinkedElement(this);
        return element.tagName;
    },
    get classList(): DOMTokenList {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        let { classListObj } = vm;
        // lazy creation of the ClassList Object the first time it is accessed.
        if (!classListObj) {
            classListObj = new ClassList(vm);
            vm.classListObj = classListObj;
        }
        return classListObj;
    }
}

export { ComponentElement as Element };
