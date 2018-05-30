import assert from "./assert";
import { isUndefined, isFunction, assign, hasOwnProperty, defineProperties } from "./language";
import { createVM, removeVM, appendVM, renderVM, getCustomElementVM } from "./vm";
import { prepareForAttributeMutationFromTemplate, ViewModelReflection } from "./def";
import { ComponentConstructor } from "./component";
import { EmptyNodeList } from "./dom";

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

function querySelectorPatchedRoot() {
    return null;
}

function querySelectorAllPatchedRoot() {
    return EmptyNodeList;
}

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
export function createElement(sel: string, options: { is: ComponentConstructor }): HTMLElement {
    if (isUndefined(options) || !isFunction(options.is)) {
        throw new TypeError();
    }

    const Ctor = options.is;
    const { forceTagName } = Ctor;
    const tagName = isUndefined(forceTagName) ? sel : forceTagName;

    // Create element with correct tagName
    const element = document.createElement(tagName);
    if (hasOwnProperty.call(element, ViewModelReflection)) {
        return element;
    }

    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(sel, element, Ctor);

    // We don't support slots on root nodes
    defineProperties(element, {
        querySelectorAll: {
            value: querySelectorAllPatchedRoot,
            configurable: true,
        },
        querySelector: {
            value: querySelectorPatchedRoot,
            configurable: true,
        }
    });
    // Handle insertion and removal from the DOM manually
    element[ConnectingSlot] = () => {
        const vm = getCustomElementVM(element);
        removeVM(vm); // moving the element from one place to another is observable via life-cycle hooks
        appendVM(vm);
        // TODO: this is the kind of awkwardness introduced by "is" attribute
        // We don't want to do this during construction because it breaks another
        // WC invariant.
        if (!isUndefined(forceTagName)) {
            if (process.env.NODE_ENV !== 'production') {
                prepareForAttributeMutationFromTemplate(element, 'is');
            }
            element.setAttribute('is', sel);
        }
        renderVM(vm);
    };
    element[DisconnectingSlot] = () => {
        const vm = getCustomElementVM(element);
        removeVM(vm);
    };
    return element;
}
