import assert from "../../shared/assert";
import { isUndefined, keys, StringToLowerCase, create, toString, isString } from "../../shared/language";
import { getInternalField } from "../../shared/fields";
import { ViewModelReflection } from "../utils";
import { prepareForPropUpdate } from "../decorators/api";
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { getAttrNameFromPropName } from "../attributes";
import { elementTagNameGetter } from "../dom-api";

const EspecialTagAndPropMap = create(null, {
    input: { value: create(null, { value: { value: 1 }, checked: { value: 1 } }) },
    select: { value: create(null, { value: { value: 1 } }) },
    textarea: { value: create(null, { value: { value: 1 } }) },
});

function isLiveBindingProp(sel: string, key: string): boolean {
    // checked and value properties are considered especial, and even if the old tracked value is equal to the new tracked value
    // we still check against the element's corresponding value to be sure.
    return sel in EspecialTagAndPropMap && key in EspecialTagAndPropMap[sel];
}

function update(oldVnode: VNode, vnode: VNode) {
    const props = vnode.data.props;
    if (isUndefined(props)) {
        return;
    }
    const oldProps = oldVnode.data.props;
    if (oldProps === props) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldProps) || keys(oldProps).join(',') === keys(props).join(','), `vnode.data.props cannot change shape.`);
    }

    let key: string;
    let cur: any;
    const elm = vnode.elm as Element;
    const vm = getInternalField(elm, ViewModelReflection);
    const isFirstPatch = isUndefined(oldProps);
    const isCustomElement = !isUndefined(vm);
    const { sel } = vnode;

    for (key in props) {
        cur = props[key];

        if (process.env.NODE_ENV !== 'production') {
            if (!(key in elm)) {
                // TODO: this should never really happen because the compiler should always validate
                assert.fail(`Unknown public property "${key}" of element <${StringToLowerCase.call(elementTagNameGetter.call(elm))}>. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
            }
        }

        if (isFirstPatch) {
            // TODO: this check for undefined should not be in place after 216
            // in which case initial undefined values will be set just like any
            // other non-undefined value, and it is a responsibility of the author
            // and consumer to provide the right values.
            if (!isUndefined(cur)) {
                if (isCustomElement) {
                    prepareForPropUpdate(vm); // this is just in case the vnode is actually a custom element
                }
                elm[key] = cur;
            } else {
                // setting undefined value initial is probably a mistake by the consumer,
                // unless that the component author is accepting undefined, but we can't
                // know that as of today, this is some basic heuristics to give them some
                // warnings.
                if (isCustomElement) {
                    if (!isUndefined(elm[key]) && vm.def.props[key].config === 0) {
                        // component does not have a getter or setter
                        assert.logWarning(`Possible insufficient validation for property "${toString(key)}" in ${toString(vm)}. If the value is set to \`undefined\`, the component is not normalizing it.`);
                    }
                } else {
                    if (isString(elm[key])) {
                        assert.logWarning(`Invalid initial \`undefined\` value for for property "${toString(key)}" in Element ${toString(elm)}, it will be casted to String.`);
                    }
                }
            }
        } else if (cur !== (isLiveBindingProp(sel as string, key) ? elm[key] : (oldProps as any)[key])) {
            // if the current value is different to the previous value...
            if (isCustomElement) {
                prepareForPropUpdate(vm); // this is just in case the vnode is actually a custom element
            }
            // touching the dom only when the prop value is really changing.
            elm[key] = cur;
        }
    }
}
const propsModule: Module = {
    create: update,
    update,
};
export default propsModule;
