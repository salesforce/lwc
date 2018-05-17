import assert from "../assert";
import { isUndefined, keys, StringToLowerCase, preventExtensions, create } from "../language";
import { EmptyObject, getAttrNameFromPropName } from "../utils";
import { prepareForPropUpdate } from "../decorators/api";
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { ViewModelReflection } from "../def";

const EspecialTagAndPropMap = preventExtensions(create(null, {
    input: {
        writable: false,
        configurable: false,
        value: preventExtensions(create(null, {
            value: { writable: false, configurable: false },
            checked: { writable: false, configurable: false },
        })),
    },
    textarea: {
        writable: false,
        configurable: false,
        value: preventExtensions(create(null, {
            value: { writable: false, configurable: false },
        })),
    },
    select: {
        writable: false,
        configurable: false,
        value: preventExtensions(create(null, {
            value: { writable: false, configurable: false },
        })),
    },
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

        const shouldUpdate = isUndefined(vm) ? (
                // condition: is an especial element out of sync prop
                ((vnode as any).sel in EspecialTagAndPropMap && key in EspecialTagAndPropMap[(vnode as any).sel])
                // condition: diff is out of sync for valid prop
                || (old !== cur && key in elm)
            ) : (
                // condition: is a custom element out of sync prop
                key in elm && elm[key] !== cur
            );
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
