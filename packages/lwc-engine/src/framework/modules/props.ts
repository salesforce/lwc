import assert from "../assert";
import { isUndefined } from "../language";
import { EmptyObject, getAttrNameFromPropName } from "../utils";
import { prepareForPropUpdate } from "../decorators/api";

function update(oldVnode: VNode, vnode: VNode) {
    let oldProps = oldVnode.data.props;
    let props = vnode.data.props;

    if (isUndefined(oldProps) && isUndefined(props)) {
        return;
    }
    if (oldProps === props) {
        return;
    }

    oldProps = oldProps || EmptyObject;
    props = props || EmptyObject;

    let key: string, cur: any, old: any;
    const { elm, vm } = vnode;

    for (key in oldProps) {
        if (!(key in props) && (key in elm)) {
            elm[key] = undefined;
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (process.env.NODE_ENV !== 'production') {
            if (old !== cur && !(key in elm)) {
                // TODO: this should never really happen because the compiler should always validate
                assert.fail(`Unknown public property "${key}" of ${elm}. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
            }
        }

        if (old !== cur && (key in elm) && (key !== 'value' || elm[key] !== cur)) {
            if (process.env.NODE_ENV !== 'production') {
                if (elm[key] === cur && old !== undefined) {
                    console.warn(`Unneccessary update of property "${key}" in ${elm}.`);
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
