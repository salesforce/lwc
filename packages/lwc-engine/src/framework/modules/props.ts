import assert from "../assert";
import { isUndefined, keys, StringToLowerCase, create, preventExtensions } from "../language";
import { EmptyObject, getAttrNameFromPropName } from "../utils";
import { prepareForPropUpdate } from "../decorators/api";
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { ViewModelReflection } from "../def";

// This is the hash table with the fixed list of each PropertyKey that can have live values.
// Note: this const is locked down, so engines can probably improve the `in` operation used below
const LiveProps = preventExtensions(create(null, {
    value: { writable: false, configurable: false },
    checked: { writable: false, configurable: false }
}));

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
    const vm = elm[ViewModelReflection];
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

        // checked and value properties are considered especial, and even if the old tracked value is equal to the new tracked value
        // we still check against the element's corresponding value to be sure.
        if (((key in LiveProps && elm[key] !== cur) || old !== cur) && key in elm) {
            if (process.env.NODE_ENV !== 'production') {
                if (!(key in LiveProps) && elm[key] === cur && old !== undefined) {
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
