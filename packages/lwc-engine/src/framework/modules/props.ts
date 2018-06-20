import assert from "../assert";
import { isUndefined, keys, StringToLowerCase } from "../language";
import { ViewModelReflection, EmptyObject, getInternalField } from "../utils";
import { prepareForPropUpdate } from "../decorators/api";
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { getAttrNameFromPropName } from "../attributes";

function update(oldVnode: VNode, vnode: VNode) {
    const props = vnode.data.props;
    if (isUndefined(props)) {
        return;
    }
    let oldProps = oldVnode.data.props;
    if (oldProps === props) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldProps) || keys(oldProps).join(',') === keys(props).join(','), `vnode.data.props cannot change shape.`);
    }

    let key: string;
    let cur: any;
    let old: any;
    const elm = vnode.elm as Element;
    const vm = getInternalField(elm, ViewModelReflection);
    oldProps = isUndefined(oldProps) ? EmptyObject : oldProps;

    for (key in props) {
        cur = props[key];
        old = (oldProps as any)[key];

        if (process.env.NODE_ENV !== 'production') {
            if (old !== cur && !(key in elm)) {
                // TODO: this should never really happen because the compiler should always validate
                assert.fail(`Unknown public property "${key}" of element <${StringToLowerCase.call(elm.tagName)}>. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
            }
        }

        if (old !== cur && (key in elm) && (key !== 'value' || elm[key] !== cur)) {
            if (process.env.NODE_ENV !== 'production') {
                if (elm[key] === cur && old !== undefined) {
                    console.warn(`Unnecessary update of property "${key}" in element <${StringToLowerCase.call(elm.tagName)}>.`); // tslint:disable-line
                }
            }
            if (!isUndefined(vm)) {
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
