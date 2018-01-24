import assert from "./assert";
import { ViewModelReflection } from "./def";
import { ArrayFilter, defineProperty } from "./language";
import { isBeingConstructed } from "./component";
import { OwnerKey, isNodeOwnedByVM } from "./vm";
import { register } from "./services";
import { pierce, piercingHook } from "./piercing";

import { TargetSlot } from './membrane';
const { querySelector, querySelectorAll } = Element.prototype;

function getLinkedElement(root: Root): HTMLElement {
    return root[ViewModelReflection].vnode.elm;
}

export function shadowRootQuerySelector (shadowRoot: ShadowRoot, selector: string): MembraneObject | null {
    const vm = shadowRoot[ViewModelReflection];

    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), `this.root.querySelector() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
    }

    const elm = getLinkedElement(shadowRoot);
    pierce(vm, elm);
    const querySelector = piercingHook(vm.membrane, elm, 'querySelector', elm.querySelector);
    return querySelector.call(elm, selector);
}

export function shadowRootQuerySelectorAll (shadowRoot: ShadowRoot, selector: string): MembraneObject {
    const vm = shadowRoot[ViewModelReflection];
    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), `this.root.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
    }
    const elm = getLinkedElement(shadowRoot);
    pierce(vm, elm);
    const querySelectorAll = piercingHook(vm.membrane, elm, 'querySelectorAll', elm.querySelectorAll);
    return querySelectorAll.call(elm, selector);
}

export function Root(vm: VM): ShadowRoot {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

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
    querySelector(selector: string): MembraneObject | null {
        const node = shadowRootQuerySelector(this, selector);
        if (process.env.NODE_ENV !== 'production') {
            const vm = this[ViewModelReflection];
            if (!node && vm.component.querySelector(selector)) {
                assert.logWarning(`this.root.querySelector() can only return elements from the template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
            }
        }
        return node;
    },
    querySelectorAll(selector: string): MembraneObject {
        const nodeList = shadowRootQuerySelectorAll(this, selector);
        if (process.env.NODE_ENV !== 'production') {
            const vm = this[ViewModelReflection];
            if (nodeList.length === 0 && vm.component.querySelectorAll(selector).length) {
                assert.logWarning(`this.root.querySelectorAll() can only return elements from template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
            }
        }
        return nodeList;
    },
    toString(): string {
        const vm = this[ViewModelReflection];
        return `Current ShadowRoot for ${vm.component}`;
    }
};

function getFirstMatch(vm: VM, elm: Element, selector: string): Node | null {
    const nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return pierce(vm, nodeList[i]);
        }
    }
    return null;
}

function getAllMatches(vm: VM, elm: Element, selector: string): NodeList {
    const nodeList = querySelectorAll.call(elm, selector);
    const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => isNodeOwnedByVM(vm, node));
    return pierce(vm , filteredNodes);
}

function isParentNodeKeyword(key: string | Symbol): boolean {
    return (key === 'parentNode' || key === 'parentElement');
}

function isCrossOriginIframeWindow(key: PropertyKey, value: any) {
    return (key === 'contentWindow') && value.window === value;
}

export function wrapIframeWindow(win: Window) {
    return {
        [TargetSlot]: win,
        postMessage() {
            return win.postMessage.apply(win, arguments);
        },
        blur() {
            return win.blur.apply(win, arguments);
        },
        close() {
            return win.close.apply(win, arguments);
        },
        focus() {
            return win.focus.apply(win, arguments);
        },
        get closed() {
            return win.closed;
        },
        get frames() {
            return win.frames;
        },
        get length() {
            return win.length;
        },
        get location() {
            return win.location;
        },
        set location(value) {
            (win.location as any) = value;
        },
        get opener() {
            return win.opener;
        },
        get parent() {
            return win.parent;
        },
        get self() {
            return win.self;
        },
        get top() {
            return win.top;
        },
        get window() {
            return win.window;
        },
    }
}

// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing(component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>, target: Replicable, key: Symbol | string, value: any, callback: (value?: any) => void) {
        const vm: VM = component[ViewModelReflection];
        const { elm } = (vm.vnode as ComponentVNode); // eslint-disable-line no-undef
        if (value) {
            if (isCrossOriginIframeWindow(key as PropertyKey, value)) {
                callback(wrapIframeWindow(value));
            }
            if (value === querySelector) {
                // TODO: it is possible that they invoke the querySelector() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback((selector: string): Node | null => getFirstMatch(vm, target, selector));
            }
            if (value === querySelectorAll) {
                // TODO: it is possible that they invoke the querySelectorAll() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback((selector: string): NodeList => getAllMatches(vm, target, selector));
            }
            if (isParentNodeKeyword(key)) {
                if (value === elm) {
                    // walking up via parent chain might end up in the shadow root element
                    return callback(component.root);
                } else if (target[OwnerKey] !== value[OwnerKey]) {
                    // cutting out access to something outside of the shadow of the current target (usually slots)
                    return callback();
                }
            }
            if (value === elm) {
                // prevent access to the original Host element
                return callback(component);
            }
        }
    }
});
