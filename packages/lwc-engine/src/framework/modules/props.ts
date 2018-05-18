import assert from "../assert";
import { isUndefined, keys, StringToLowerCase } from "../language";
import { EmptyObject, getAttrNameFromPropName, makeReadOnlyRecord, hasPropertyGetter } from "../utils";
import { prepareForPropUpdate } from "../decorators/api";
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { ViewModelReflection } from "../utils";
import { VM } from "../vm";

const EspecialTagAndPropMap = makeReadOnlyRecord({
    input: makeReadOnlyRecord({ value: 0, checked: 0 }),
    select: makeReadOnlyRecord({ value: 0 }),
    textarea: makeReadOnlyRecord({ value: 0 }),
});

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
    const vm: VM = elm[ViewModelReflection];
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

        let shouldUpdate;
        if (isUndefined(vm)) {
            // regular element
            const { sel } = vnode as any;
            shouldUpdate = (
                // condition: is an especial element out of sync prop
                (sel in EspecialTagAndPropMap && key in EspecialTagAndPropMap[sel]) ?
                    elm[key] !== cur
                    // condition: diff is out of sync for valid prop
                    : (old !== cur && key in elm)
            );
        } else {
            // custom element
            const propDef = vm.def.props[key];
            // condition: is a custom element out of sync prop
            shouldUpdate = (!isUndefined(propDef) && hasPropertyGetter(propDef.config)) ? elm[key] !== cur : old !== cur;
        }

        if (shouldUpdate) {
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
