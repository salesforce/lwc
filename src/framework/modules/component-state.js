import {
    resetComponentProp,
    updateComponentProp,
} from "../component.js";

function syncState(oldVnode: vnode, vnode: VM) {
    const { cache } = vnode;
    if (!cache) {
        return;
    }

    let { data: { props: oldProps } } = oldVnode;
    let { data: { props } } = vnode;
    const { state } = cache;
    let key: string, cur: any;

    if (oldProps !== props && (oldProps || props)) {
        oldProps = oldProps || {};
        props = props || {};
        // removed props should be resetted in component's props
        for (key in oldProps) {
            if (!(key in props)) {
                resetComponentProp(vnode, key);
            }
        }

        // new props should be setted in component's props
        for (key in props) {
            cur = props[key];
            if ((key in oldProps && oldProps[key] !== cur) ||
                !(key in state) || state[key] !== cur) {
                updateComponentProp(vnode, key, cur);
            }
        }
    }

}

export default {
    create: syncState,
    update: syncState,
};
