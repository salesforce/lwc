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
    vnode(vnode: VNode) {
        assert.isTrue(vnode && "sel" in vnode && "data" in vnode && "children" in vnode && "text" in vnode && "elm" in vnode && "key" in vnode, `${vnode} is not a vnode.`);
    },
    vm(vm: VM) {
        assert.isTrue(vm && "component" in vm, `${vm} is not a vm.`);
    },
    fail(msg: string) {
        throw new Error(msg);
    },
    logError(msg: string) {
        try {
            throw new Error(msg);
        } catch (e) {
            console.error(e);
        }
    },
    logWarning(msg: string) {
        try {
            throw new Error(msg);
        } catch (e) {
            console.warn(e);
        }
    },
};

export default assert;
