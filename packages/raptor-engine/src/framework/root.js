import assert from "./assert.js";
import { ViewModelReflection } from "./html-element.js";
import { defineProperty } from "./language.js";
import { vmBeingConstructed } from "./component.js";

function invokedFromConstructor(component: ComponentElement): boolean {
    return vmBeingConstructed && vmBeingConstructed.component === component;
}

function getLinkedElement(root): HTMLElement {
    return root[ViewModelReflection].vnode.elm;
}

export function Root(vm: VM): ShadowRoot {
    defineProperty(this, ViewModelReflection, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}

Root.prototype = {
    querySelector(selectors: string): Element {
        const elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        assert.isTrue(invokedFromConstructor(this), `this.root.querySelector() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
        return elm.querySelectorAll(selectors)[0];
    },
    querySelectorAll(selectors: string): NodeList {
        const elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        assert.isTrue(invokedFromConstructor(this), `this.root.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
        return elm.querySelectorAll(selectors);
    },
    toString(): string {
        const vm = this[ViewModelReflection];
        return `Current ShadowRoot for ${vm.component}`;
    }
};
