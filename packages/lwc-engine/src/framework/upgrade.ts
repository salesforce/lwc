import assert from "./assert";
import { isUndefined, assign, isNull, isObject } from "./language";
import { createVM, removeVM, appendVM, renderVM, getCustomElementVM, getNodeKey } from "./vm";
import { ComponentConstructor } from "./component";
import { resolveCircularModuleDependency } from "./utils";
import { setAttribute } from "./dom-api";

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

    const Ctor = resolveCircularModuleDependency((options as any).is);

    let { mode, fallback } = (options as any);
    // TODO: for now, we default to open, but eventually it should default to 'closed'
    if (mode !== 'closed') { mode = 'open'; }
    // TODO: for now, we default to true, but eventually it should default to false
    if (fallback !== false) { fallback = true; }

    // extracting the registered constructor just in case we need to force the tagName
    const { forceTagName } = Ctor as ComponentConstructor;
    const tagName = isUndefined(forceTagName) ? sel : forceTagName;

    // Create element with correct tagName
    const element = document.createElement(tagName);
    if (!isUndefined(getNodeKey(element))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here.
        return element;
    }

    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(sel, element, Ctor, { mode, fallback, isRoot: true });
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
