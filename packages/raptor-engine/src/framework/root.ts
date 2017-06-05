import assert from "./assert";
import { ViewModelReflection } from "./html-element";
import { ArrayFilter, defineProperty } from "./language";
import { isBeingConstructed } from "./component";
import { isNodeOwnedByVM } from "./vm";

function getLinkedElement(root: Root): HTMLElement {
    return root[ViewModelReflection].vnode.elm;
}

function querySelectorAllFromRoot(root: ShadowRoot, selectors: string): NodeList {
    const elm = getLinkedElement(root);
    return elm.querySelectorAll(selectors);
}

export function Root(vm: VM): ShadowRoot {
    assert.vm(vm);
    defineProperty(this, ViewModelReflection, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}

Root.prototype = {
    get mode(): string {
        return 'closed';
    },
    get host(): Component {
        return this[ViewModelReflection].component;
    },
    querySelector(selectors: string): Node | undefined {
        const vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), `this.root.querySelector() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
        const nodeList = querySelectorAllFromRoot(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (isNodeOwnedByVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return nodeList[i];
            }
        }
        assert.block(() => {
            if (vm.component.querySelector(selectors)) {
                assert.logWarning(`this.root.querySelector() can only return elements from the template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
            }
        });
    },
    querySelectorAll(selectors: string): NodeList {
        const vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), `this.root.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
        const nodeList = querySelectorAllFromRoot(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => isNodeOwnedByVM(vm, node));
        assert.block(() => {
            if (filteredNodes.length === 0 && vm.component.querySelectorAll(selectors).length) {
                assert.logWarning(`this.root.querySelectorAll() can only return elements from template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
            }
        });
        return filteredNodes;
    },
    toString(): string {
        const vm = this[ViewModelReflection];
        return `Current ShadowRoot for ${vm.component}`;
    }
};
