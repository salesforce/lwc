// @flow

export default function dismounter(vnode: Object): Node {
    if (!vnode) {
        return null;
    }
    const { isMounted, domNode } = vnode;
    if (!isMounted) {
        throw new Error(`Assert: Component element ${vnode} must be mounted.`);
    }
    vnode.toBeDismount();
    // assert: vnode.isMounted === true
    return domNode;
}
