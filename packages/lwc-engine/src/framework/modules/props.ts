import assert from "../assert";
import { isUndefined, keys, StringToLowerCase, create } from "../language";
import { ViewModelReflection, getInternalField } from "../utils";
import { prepareForPropUpdate } from "../decorators/api";
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { getAttrNameFromPropName } from "../attributes";

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
                assert.fail(`Unknown public property "${key}" of element <${StringToLowerCase.call(elm.tagName)}>. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
            }
        }

        // if it is the first time this element is patched, or the current value is different to the previous value...
        if (isFirstPatch || cur !== (isLiveBindingProp(sel as string, key) ? elm[key] : (oldProps as any)[key])) {
            if (isCustomElement) {
                prepareForPropUpdate(vm); // this is just in case the vnode is actually a custom element
            }
            // touching the dom if the prop really changes.
            elm[key] = cur;
        }
    }
}
const propsModule: Module = {
    create: update,
    update,
};
export default propsModule;
