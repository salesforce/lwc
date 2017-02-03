import {
    resetComponentProp,
    updateComponentProp,
} from "../component.js";

function syncProps(oldVnode: vnode, vnode: VM) {
    const { cache } = vnode;
    if (!cache) {
        return;
    }

    let { data: { props: oldProps } } = oldVnode;
    let { data: { props } } = vnode;
    let key: string, cur: any;

    if (oldProps !== props && (oldProps || props)) {
        oldProps = oldProps || {};
        props = props || {};
        // removed props should be reset in component's props
        for (key in oldProps) {
            if (!(key in props)) {
                resetComponentProp(vnode, key);
            }
        }

        // new or different props should be set in component's props
        for (key in props) {
            cur = props[key];
            if (!(key in oldProps) || oldProps[key] != cur) {
                updateComponentProp(vnode, key, cur);
            }
        }
    }

}

export default {
    create: syncProps,
    update: syncProps,
};
