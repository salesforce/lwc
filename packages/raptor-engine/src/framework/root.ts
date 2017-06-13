import assert from "./assert";
import { ViewModelReflection } from "./html-element";
import { ArrayFilter, defineProperty } from "./language";
import { isBeingConstructed } from "./component";
import { OwnerKey, isNodeOwnedByVM, getMembrane } from "./vm";
import { register } from "./services";
import { getTarget } from "./membrane";

const { querySelector, querySelectorAll } = Element.prototype;

function getLinkedElement(root: Root): HTMLElement {
    return root[ViewModelReflection].vnode.elm;
}

export function shadowRootQuerySelector (shadowRoot: ShadowRoot, selector: string): MembraneObject | undefined {
    const vm = shadowRoot[ViewModelReflection];
    assert.isFalse(isBeingConstructed(vm), `this.root.querySelector() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
    const elm = getLinkedElement(shadowRoot);
    
    return getMembrane(vm).pierce(elm).querySelector(selector);
}

export function shadowRootQuerySelectorAll (shadowRoot: ShadowRoot, selector: string): MembraneObject {
    const vm = shadowRoot[ViewModelReflection];
    assert.isFalse(isBeingConstructed(vm), `this.root.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
    const elm = getLinkedElement(shadowRoot);
    
    return getMembrane(vm).pierce(elm).querySelectorAll(selector);
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
    querySelector(selector: string): Element | undefined {
        const node = shadowRootQuerySelector(this, selector);
        const vm = this[ViewModelReflection];
        const membrane = getMembrane(vm);
        assert.block(() => {
            const vm = this[ViewModelReflection];
            if (!node && vm.component.querySelector(selector)) {
                assert.logWarning(`this.root.querySelector() can only return elements from the template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
            }
        });
        return getTarget(membrane, node);
    },
    querySelectorAll(selector: string): MembraneObject {
        const nodeList = shadowRootQuerySelectorAll(this, selector);
        assert.block(() => {
            const vm = this[ViewModelReflection];
            if (nodeList.length === 0 && vm.component.querySelectorAll(selector).length) {
                assert.logWarning(`this.root.querySelectorAll() can only return elements from template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
            }
        });
        return nodeList;
    },
    toString(): string {
        const vm = this[ViewModelReflection];
        return `Current ShadowRoot for ${vm.component}`;
    }
};

function getFirstMatch(vm: VM, elm: Element, selector: string): Node | undefined {
    const nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return getMembrane(vm).pierce(nodeList[i]);
        }
    }
}

function getAllMatches(vm: VM, elm: Element, selector: string): NodeList {
    const nodeList = querySelectorAll.call(elm, selector);
    const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => isNodeOwnedByVM(vm, node));
    return getMembrane(vm).pierce(filteredNodes);
}

function isParentNodeKeyword(key: string): boolean {
    return (key === 'parentNode' || key === 'parentElement');
}

// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing(component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>, target: Replicable, key: Symbol | string, value: any, callback: (value: any) => void) {
        if (value === querySelector) {
            // TODO: it is possible that they invoke the querySelector() function via call or apply to set a new context, what should
            // we do in that case? Right now this is essentially a bound function, but the original is not.
            return callback((selector: string): Node | undefined => getFirstMatch(component[ViewModelReflection], target, selector));
        }
        if (value === querySelectorAll) {
            // TODO: it is possible that they invoke the querySelectorAll() function via call or apply to set a new context, what should
            // we do in that case? Right now this is essentially a bound function, but the original is not.
            return callback((selector: string): Node | undefined => getAllMatches(component[ViewModelReflection], target, selector));
        }
        if (value && value.splitText && isParentNodeKeyword(key)) {
            if (value === component[ViewModelReflection].vnode.elm) {
                // walking up via parent chain might end up in the shadow root element
                return callback(component.root);
            } else if (target[OwnerKey] !== value[OwnerKey]) {
                // cutting out access to something outside of the shadow of the current target by calling back with undefined
                return callback();
            }
        }
    }
});
