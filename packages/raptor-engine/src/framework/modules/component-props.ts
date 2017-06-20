import {
    resetComponentProp,
    updateComponentProp,
    createComponentComputedValues,
} from "../component";
import { assign, isUndefined } from "../language";
import { EmptyObject } from "../utils";

function syncProps(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }

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
                resetComponentProp(vm, key);
            }
        }

        // new or different props should be set in component's props
        for (key in newProps) {
            cur = newProps[key];
            if (!(key in oldProps) || oldProps[key] != cur) {
                updateComponentProp(vm, key, cur);
            }
        }
    }

    if (vm.idx === 0) {
        createComponentComputedValues(vm);
    }

    // TODO: opt out if cmpProps is empty (right now it is never empty)
    (vnode.data as VNodeData).props = assign({}, vm.cmpProps, vm.cmpComputed);
}

export default {
    create: syncProps,
    update: syncProps,
};
