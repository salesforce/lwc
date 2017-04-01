import assert from "./assert.js";
import * as api from "./api.js";
import { isArray, isObject, create, indexOf, slice, isUndefined, toString, hasOwnProperty, bind } from "./language.js";
import { getOwnFields, extractOwnFields } from "./properties.js";
import { vmBeingRendered } from "./invoker.js";
import { subscribeToSetHook } from "./watcher.js";

const EmptySlots = create(null);

function wrapDOMNode(element: Node): VNode {
    // TODO: generalize this to support all kind of Nodes
    // TODO: instead of creating the h() directly, use toVNode() or something else from snabbdom
    // TODO: the element could be derivated from another raptor component, in which case we should
    // use the corresponding vnode instead
    assert.isTrue(element instanceof HTMLElement, "Only HTMLElements can be wrapped by h()");
    const tagName = element.tagName.toLowerCase();
    // TODO: support "is"" attribute
    const vnode = api.h(tagName, {});
    vnode.elm = element;
    return vnode;
}

function normalizeRenderResult(vm: VM, elementOrVnodeOrArrayOfVnodes: any): Array<VNode> {
    if (!elementOrVnodeOrArrayOfVnodes) {
        return [];
    }
    // never mutate the original array
    const vnodes = isArray(elementOrVnodeOrArrayOfVnodes) ? slice.call(elementOrVnodeOrArrayOfVnodes, 0) : [elementOrVnodeOrArrayOfVnodes];
    for (let i = 0; i < vnodes.length; i += 1) {
        const elm = vnodes[i];
        // TODO: we can improve this detection mechanism
        if (elm && (elm.sel || elm.text)) {
            // this is usually the default behavior, we wire this up for that reason.
            assert.vnode(elm, `Invalid element ${toString(vnodes[i])} returned in ${i + 1} position when calling ${vm}.render().`);
        } else if (elm instanceof Node) {
            vnodes[i] = wrapDOMNode(elm);
        } else {
            // supporting text nodes
            vnodes[i] = { text: (elm === null || isUndefined(elm)) ? '' : elm + '' };
        }
    }
    return vnodes;
}

function getSlotsetValue(slotset: HashTable<Array<VNodes>>, slotName: string): Array<VNodes> {
    assert.isTrue(isObject(slotset), `Invalid slotset value ${toString(slotset)}`);
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}

const slotsetProxyHandler = {
    get: (slotset: Object, key: string | Symbol): any => getSlotsetValue(slotset, key),
    set: (): boolean => {
        assert.invariant(false, `$slotset object cannot be mutated from template.`);
        return false;
    },
    deleteProperty: (): boolean => {
        assert.invariant(false, `$slotset object cannot be mutated from template.`);
        return false;
    },
};

// we use inception to track down the memoized object for each value used in a template from a component
let currentMemoized: HashTable<any> | null = null;

const cmpProxyHandler = {
    get: (cmp: Object, key: string | Symbol): any => {
        if (currentMemoized === null || vmBeingRendered === null || vmBeingRendered.component !== cmp) {
            throw new Error(`Internal Error: getFieldValue() should only be accessible during rendering phase.`);
        }
        if (key in currentMemoized) {
            return currentMemoized[key];
        }
        assert.block(function devModeCheck() {
            if (hasOwnProperty.call(cmp, key)) {
                const fields = getOwnFields(cmp);
                switch (fields[key]) {
                    case 1:
                        assert.logError(`The template used by ${cmp} is accessing \`this.${toString(key)}\` directly, which is declared in the constructor and considered a private field. It can only be used from template via a getter, and will not be reactive unless it is moved to \`this.state.${toString(key)}\`.`);
                        break;
                    case 2:
                        assert.logError(`The template used by ${cmp} is accessing \`this.${toString(key)}\` directly, which is added as an expando property of the component and considered a private field. It can only be used from the template via a getter, and will not be reactive unless it is moved to \`this.state.${toString(key)}\`.`);
                        break;
                    case 3:
                        assert.logError(`The template used by ${cmp} is accessing \`this.${toString(key)}\`, which is considered a mutable private field. This property cannot be used as part of the UI because mutations of it cannot be observed. Alternative, you can move this property to \`this.state.${toString(key)}\` to access it from the template.`);
                        break;
                    default:
                        // TODO: this should never really happen because the compiler should always validate
                        console.warn(`The template used by ${cmp} is accessing \`this.${toString(key)}\`, which is not declared. This is probably a typo on the template.`);
                }
            }
        });

        // slow path to access component's properties from template
        let value;
        const { cmpState, cmpProps, def: { props: publicPropsConfig } } = vmBeingRendered;
        if (key === 'state' && cmpState) {
            value = cmpState;
        } else if (key in publicPropsConfig) {
            subscribeToSetHook(vmBeingRendered, cmpProps, key);
            value = cmpProps[key];
        } else {
            value = cmp[key];
        }
        if (typeof value === 'function') {
            // binding every function value accessed from template
            value = bind(value, cmp);
        }
        currentMemoized[key] = value;
        return value;
    },
    set: (cmp: Object, key: string | Symbol): boolean => {
        assert.logError(`Invalid assigment: ${cmp} cannot set a new value for property ${key} during the rendering phase.`);
        return false;
    },
    deleteProperty: (cmp: Object, key: string | Symbol): boolean => {
        assert.logError(`Invalid delete statement: Component "${cmp}" cannot delete property ${key} during the rendering phase.`);
        return false;
    },
};

export function evaluateTemplate(html: any, vm: VM): Array<VNode> {
    assert.vm(vm);
    let result = html;
    // when `html` is a facotyr, it has to be invoked
    // TODO: add identity to the html functions
    if (typeof html === 'function') {
        let { component, context, cmpSlots = EmptySlots } = vm;
        assert.block(function devModeCheck() {
            // before every render, in dev-mode, we will like to know all expandos and
            // all private-fields-like properties, so we can give meaningful errors.
            extractOwnFields(component);

            // validating slot names
            const { slots = [] } = html;
            for (let slotName in cmpSlots) {
                if (indexOf.call(slots, slotName) === -1) {
                    // TODO: this should never really happen because the compiler should always validate
                    console.warn(`Ignoreing unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`);
                }
            }

            // validating identifiers used by template that should be provided by the component
            const { ids = [] } = html;
            ids.forEach((propName: string) => {
                if (!(propName in component)) {
                    // TODO: this should never really happen because the compiler should always validate
                    console.warn(`The template rendered by ${vm} might attempt to access \`this.${propName}\`, which is not declared. This is probably a typo on the template.`);
                }
            });

        });
        const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
        const { proxy: cmp, revoke: componentRevoke } = Proxy.revocable(component, cmpProxyHandler);
        const outerMemoized = currentMemoized;
        currentMemoized = create(null);
        result = html.call(undefined, api, cmp, slotset, context);
        currentMemoized = outerMemoized; // inception to memoize the accessing of keys from cmp for every render cycle
        slotsetRevoke();
        componentRevoke();
    }
    // the render method can return many different things, here we attempt to normalize it.
    return normalizeRenderResult(vm, result);
}
