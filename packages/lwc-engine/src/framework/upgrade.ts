import assert from "./assert";
import { isUndefined, assign, hasOwnProperty, defineProperties, isNull, isObject, isTrue } from "./language";
import { createVM, removeVM, appendVM, renderVM, getCustomElementVM } from "./vm";
import { registerComponent, getCtorByTagName } from "./def";
import { ComponentConstructor } from "./component";
import { EmptyNodeList } from "./dom/node";
import { ViewModelReflection } from "./utils";
import { setAttribute } from "./dom/element";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll } from "./dom/traverse";

const { removeChild, appendChild, insertBefore, replaceChild } = Node.prototype;
const ConnectingSlot = Symbol();
const DisconnectingSlot = Symbol();

function callNodeSlot(node: Node, slot: symbol): Node {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
    }
    if (!isUndefined(node[slot])) {
        node[slot]();
    }
    return node; // for convenience
}

// monkey patching Node methods to be able to detect the insertions and removal of
// root elements created via createElement.
assign(Node.prototype, {
    appendChild(newChild: Node): Node {
        const appendedNode = appendChild.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore(newChild: Node, referenceNode: Node): Node {
        const insertedNode = insertBefore.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild(oldChild: Node): Node {
        const removedNode = removeChild.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild(newChild: Node, oldChild: Node): Node {
        const replacedNode = replaceChild.call(this, newChild, oldChild);
        callNodeSlot(replacedNode, DisconnectingSlot);
        callNodeSlot(newChild, ConnectingSlot);
        return replacedNode;
    },
});

function querySelectorPatchedRoot(this: HTMLElement, selector): Node | null {
    const vm = getCustomElementVM(this);
    if (process.env.NODE_ENV === 'test') {
        // TODO: remove this backward compatibility branch.
        // assert.logError(`elm.querySelector() on a root element will return null, instead use elm.shadowRoot.querySelector().`);
        assert.logError(`Using elm.querySelector() on a root element created via createElement() in a test will return null very soon to enforce ShadowDOM semantics, instead use elm.shadowRoot.querySelector().`);
        return shadowRootQuerySelector(vm, selector);
    }
    return null;
}

function querySelectorAllPatchedRoot(this: HTMLElement, selector): HTMLElement[] | NodeList {
    const vm = getCustomElementVM(this);
    if (process.env.NODE_ENV === 'test') {
        // TODO: remove this backward compatibility branch.
        assert.logError(`Using elm.querySelectorAll() on a root element created via createElement() in a test will return an empty NodeList very soon to enforce ShadowDOM semantics, instead use elm.shadowRoot.querySelectorAll().`);
        return shadowRootQuerySelectorAll(vm, selector);
    }
    return EmptyNodeList;
}

const rootNodeFallbackDescriptors = {
    querySelectorAll: {
        value: querySelectorAllPatchedRoot,
        configurable: true,
    },
    querySelector: {
        value: querySelectorPatchedRoot,
        configurable: true,
    },
};

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then it throws a TypeError.
 */
export function createElement(sel: string, options: any = {}): HTMLElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError();
    }
    const { is } = (options as any);
    let { mode, fallback } = (options as any);
    // TODO: for now, we default to open, but eventually it should default to 'closed'
    if (mode !== 'closed') { mode = 'open'; }
    // TODO: for now, we default to true, but eventually it should default to false
    if (fallback !== false) { fallback = true; }
    registerComponent(sel, is);
    // extracting the registered constructor just in case we need to force the tagName
    const Ctor = getCtorByTagName(sel);
    const { forceTagName } = Ctor as ComponentConstructor;
    const tagName = isUndefined(forceTagName) ? sel : forceTagName;
    // Create element with correct tagName
    const element = document.createElement(tagName);
    if (hasOwnProperty.call(element, ViewModelReflection)) {
        return element;
    }

    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(sel, element, { mode, fallback, isRoot: true });
    if (isTrue(fallback)) {
        // We don't support slots on root nodes
        defineProperties(element, rootNodeFallbackDescriptors);
    }
    // Handle insertion and removal from the DOM manually
    element[ConnectingSlot] = () => {
        const vm = getCustomElementVM(element);
        removeVM(vm); // moving the element from one place to another is observable via life-cycle hooks
        appendVM(vm);
        // TODO: this is the kind of awkwardness introduced by "is" attribute
        // We don't want to do this during construction because it breaks another
        // WC invariant.
        if (!isUndefined(forceTagName)) {
            setAttribute.call(element, 'is', sel);
        }
        renderVM(vm);
    };
    element[DisconnectingSlot] = () => {
        const vm = getCustomElementVM(element);
        removeVM(vm);
    };
    return element;
}
