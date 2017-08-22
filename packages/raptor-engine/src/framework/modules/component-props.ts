import assert from "../assert";
import { prepareForPropUpdate } from "../decorators/api";
import { isUndefined } from "../language";
import { EmptyObject, getAttrNameFromPropName } from "../utils";

function syncProps(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }

    const { component, def: { props: publicProps } } = vm;
    let { data: { _props: oldProps } } = oldVnode;
    let { data: { _props: newProps } } = vnode;

    // infuse key-value pairs from _props into the component
    if (oldProps !== newProps && (oldProps || newProps)) {
        let key: string, cur: any;
        oldProps = oldProps || EmptyObject;
        newProps = newProps || EmptyObject;
        // removed props should be reset in component's props
        for (key in oldProps) {
            if (!(key in newProps)) {
                prepareForPropUpdate(vm);
                component[key] = undefined;
            }
        }

        // new or different props should be set in component's props
        for (key in newProps) {
            cur = newProps[key];
            if (!(key in oldProps) || oldProps[key] != cur) {
                if (isUndefined(publicProps[key])) {
                    // TODO: this should never really happen because the compiler should always validate
                    assert.fail(`Ignoring unknown public property "${key}" of ${vm}. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
                    return;
                }
                prepareForPropUpdate(vm);
                component[key] = cur;
            }
        }
    }

    // Note: _props, which comes from api.c()'s data.props, is only used to populate
    //       public props, and any other alien key added to it by the compiler will be
    //       ignored, and a warning is shown.
}

export default {
    create: syncProps,
    update: syncProps,
};
