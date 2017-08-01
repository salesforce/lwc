import assert from "./assert";
import { patch } from "./patch";
import { scheduleRehydration } from "./vm";
import { invokeComponentAttributeChangedCallback } from "./invoker";
import { updateComponentProp } from "./component";
import { getComponentDef } from "./def";
import { c } from "./api";
import { isUndefined, isFunction, assign } from "./language";
import { getPropNameFromAttrName } from "./utils";
import { destroy, insert } from "./hook";

const { getAttribute, setAttribute, removeAttribute } = Element.prototype;
const { removeChild, appendChild, insertBefore, replaceChild } = Node.prototype;
const ConnectingSlot = Symbol();
const DisconnectingSlot = Symbol();

function callNodeSlot(node: Node, slot: symbol): Node {
    if (slot in node) {
        node[slot]();
    }
    return node;
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
    }
});

function linkAttributes(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { def: { props: propsConfig, observedAttrs } } = vm;
    // replacing mutators and accessors on the element itself to catch any mutation
    element.getAttribute = (attrName: string): string | null => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead access the public property with \`element.${propName};\`.`);
            return;
        }
        return getAttribute.call(element, attrName);
    };
    element.setAttribute = (attrName: string, newValue: any) => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead update the public property with \`element.${propName} = value;\`.`);
            return;
        }
        const oldValue = getAttribute.call(element, attrName);
        setAttribute.call(element, attrName, newValue);
        newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    };
    element.removeAttribute = (attrName: string) => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead update the public property with \`element.${propName} = undefined;\`.`);
            return;
        }

        assert.block(function devModeCheck() {
            const propName = getPropNameFromAttrName(attrName);
            if (propsConfig[propName]) {
                updateComponentProp(vm, propName, newValue);
                if (vm.isDirty) {
                    console.log(`Scheduling ${vm} for rehydration.`);
                    scheduleRehydration(vm);
                }
            }
        });
        const oldValue = getAttribute.call(element, attrName);
        removeAttribute.call(element, attrName);
        const newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    };
}

function getInitialProps(element: HTMLElement, Ctor: Class<Component>): HashTable<any> {
    const { props: config } = getComponentDef(Ctor);
    const props = {};
    for (let propName in config) {
        if (propName in element) {
            props[propName] = element[propName];
        }
    }
    return props;
}

function getInitialSlots(element: HTMLElement, Ctor: Class<Component>): HashTable<any> {
    const { slotNames } = getComponentDef(Ctor);
    if (isUndefined(slotNames)) {
        return;
    }
    // TODO: implement algo to resolve slots
    return undefined;
}

/**
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element: HTMLElement, Ctor: Class<Component>) {
    if (isUndefined(Ctor)) {
        throw new TypeError(`Invalid Component Definition: ${Ctor}.`);
    }
    const props = getInitialProps(element, Ctor);
    const slotset = getInitialSlots(element, Ctor);
    const tagName = element.tagName.toLowerCase();
    const vnode = c(tagName, Ctor, { props, slotset, className: element.className || undefined });
    vnode.isRoot = true;
    // TODO: eventually after updating snabbdom we can use toVNode(element)
    // as the first argument to reconstruct the vnode that represents the
    // current state.
    const { vm } = patch(element, vnode);
    linkAttributes(element, vm);
    // providing the hook to detect insertion and removal
    element[ConnectingSlot] = () => {
        insert(vnode);
    };
    element[DisconnectingSlot] = () => {
        destroy(vnode);
    };
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
 * then we fallback to the normal Web-Components workflow.
 */
export function createElement(tagName: string, options: any = {}): HTMLElement {
    const Ctor = isFunction(options.is) ? options.is : null;
    const element = document.createElement(tagName, Ctor ? null : options);

    if (Ctor && element instanceof HTMLElement) {
        upgradeElement(element, Ctor);
    }
    return element;
}

// TODO: how can a user dismount a component and kick in the destroy mechanism?
