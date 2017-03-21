import assert from "../assert.js";
import {
    resetComponentProp,
    updateComponentProp,
} from "../component.js";
import { assign, create } from "../language.js";

const EmptyObj = create(null);

function syncProps(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (!vm) {
        return;
    }

    let { data: { _props: oldProps } } = oldVnode;
    let { data: { _props: newProps } } = vnode;

    // infuse key-value pairs from _props into the component
    if (oldProps !== newProps && (oldProps || newProps)) {
        let key: string, cur: any;
        oldProps = oldProps || EmptyObj;
        newProps = newProps || EmptyObj;
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

    // reflection of component props into data.props for the regular diffing algo
    assert.invariant(vnode.data.props === undefined, 'vnode.data.props should be undefined.');
    // TODO: opt out if cmpProps is empty (right now it is never empty)
    vnode.data.props = assign({}, vm.cmpProps);
}

export default {
    create: syncProps,
    update: syncProps,
};
