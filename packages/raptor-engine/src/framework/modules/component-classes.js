import assert from "../assert.js";

function syncClassNames(oldVnode: VNode, vnode: ComponentVNode) {
    const { data, vm } = vnode;
    assert.invariant(data.class === undefined, `Engine Error: vnode.data.class should be undefined for ${vm}.`);
    let { className, classMap } = data;
    if (!className && !classMap && !vm) {
        return;
    }

    // split className, and make it a map object, this is needed in case the consumer of
    // the component provides a computed value, e.g.: `<x class={computedClassname}>`.
    // In this
    if (className) {
        assert.invariant(!classMap, `Compiler Error: vnode.data.classMap cannot be present when vnode.data.className is defined for ${vm}.`);
        classMap = className.split(/\s+/).reduce((r: HashTable<boolean>, v: string): HashTable<boolean> => {
            r[v] = true;
            return r;
        }, {});
    }
    let cmpClassMap;
    if (vm) {
        cmpClassMap = vm.cmpClasses;
    }
    if (classMap || cmpClassMap) {
        // computing the mashup between className (computed), classMap, and cmpClassMap (from component)
        data.class = Object.assign({}, classMap, cmpClassMap);
    }
}

export default {
    create: syncClassNames,
    update: syncClassNames,
};
