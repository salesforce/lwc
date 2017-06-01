import assert from "./assert";
import * as api from "./api";
import { isArray, isFunction, isObject, create, ArrayIndexOf, toString, hasOwnProperty } from "./language";
import { getOwnFields, extractOwnFields } from "./properties";
import { vmBeingRendered } from "./invoker";
import { subscribeToSetHook } from "./watcher";

const EmptySlots = create(null);

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
        assert.invariant(currentMemoized !== null && vmBeingRendered !== null && vmBeingRendered.component === cmp, ` getFieldValue() should only be accessible during rendering phase.`);
        if (key in currentMemoized) {
            return currentMemoized[key];
        }
        assert.block(function devModeCheck() {
            if (hasOwnProperty.call(cmp, key)) {
                const fields = getOwnFields(cmp);
                switch (fields[key]) {
                    case 1:
                        assert.logError(`${cmp}'s template is accessing \`this.${toString(key)}\` directly, which is declared in the constructor and considered a private field. Instead access it via a getter or make it reactive by moving it to \`this.state.${toString(key)}\`.`);
                        break;
                    case 2:
                        assert.logError(`${cmp}'s template is accessing \`this.${toString(key)}\` directly, which is added as an expando property of the component and considered a private field. Instead access it via a getter or make it reactive by moving it to \`this.state.${toString(key)}\`.`);
                        break;
                    case 3:
                        assert.logError(`${cmp}'s template is accessing \`this.${toString(key)}\`, which is considered a mutable private field but mutations cannot be observed. Instead move it to \`this.state.${toString(key)}\`.`);
                        break;
                    default:
                        // TODO: this should never really happen because the compiler should always validate
                        console.warn(`${cmp}'s template is accessing \`this.${toString(key)}\`, which is not declared by the component. This is likely a typo in the template.`);
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
        currentMemoized[key] = value;
        return value;
    },
    set: (cmp: Object, key: string | Symbol): boolean => {
        assert.logError(`Invalid assignment: ${cmp} cannot set a new value for property ${key} during the rendering phase.`);
        return false;
    },
    deleteProperty: (cmp: Object, key: string | Symbol): boolean => {
        assert.logError(`Invalid delete statement: ${cmp} cannot delete property ${key} during the rendering phase.`);
        return false;
    },
};

export function evaluateTemplate(vm: VM, html: any): Array<VNode|null> {
    assert.vm(vm);
    assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);
    // TODO: add identity to the html functions
    let { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache momizer for template when needed
    if (html !== cmpTemplate) {
        context.tplCache = create(null);
        vm.cmpTemplate = html;
    }
    assert.isTrue(typeof context.tplCache === 'object', `vm.context.tplCache must be an object associated to ${cmpTemplate}.`);
    assert.block(function devModeCheck() {
        // before every render, in dev-mode, we will like to know all expandos and
        // all private-fields-like properties, so we can give meaningful errors.
        extractOwnFields(component);

        // validating slot names
        const { slots = [] } = html;
        for (let slotName in cmpSlots) {
            if (ArrayIndexOf.call(slots, slotName) === -1) {
                // TODO: this should never really happen because the compiler should always validate
                console.warn(`Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`);
            }
        }

        // validating identifiers used by template that should be provided by the component
        const { ids = [] } = html;
        ids.forEach((propName: string) => {
            if (!(propName in component)) {
                // TODO: this should never really happen because the compiler should always validate
                console.warn(`The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`);
            }
        });

    });
    const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
    const { proxy: cmp, revoke: componentRevoke } = Proxy.revocable(component, cmpProxyHandler);
    const outerMemoized = currentMemoized;
    currentMemoized = create(null);
    let vnodes = html.call(undefined, api, cmp, slotset, context.tplCache);
    assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    currentMemoized = outerMemoized; // inception to memoize the accessing of keys from cmp for every render cycle
    slotsetRevoke();
    componentRevoke();
    return vnodes;
}
