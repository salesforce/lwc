// @flow

const assert = {
    invariant(value: any, msg: string) {
        if (!value) {
            throw new Error(`Invariant Violation: ${msg}`);
        }
    },
    isTrue(value: any, msg: string) {
        if (!value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    isFalse(value: any, msg: string) {
        if (value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    block(fn: Object) {
        fn.call();
    },
    vnode(vnode: Object) {
        assert.isTrue(vnode && "sel" in vnode && "data" in vnode && "children" in vnode && "text" in vnode && "elm" in vnode && "key" in vnode, `${vnode} is not a vnode.`);
    },
    vm(vm: Object) {
        assert.isTrue(vm && "Ctor" in vm && "data" in vm && "children" in vm && "text" in vm && "elm" in vm && "key" in vm, `${vm} is not a vm.`);
    },
    fail(msg: string) {
        throw new Error(msg);
    },
};

export default assert;
