import assert from "../assert.js";
import { assign } from "../language.js";
import { isUndefined } from "../language.js";
import { getMapFromClassName } from "../utils.js";

function syncClassNames(oldVnode: VNode, vnode: ComponentVNode) {
    const { data, vm } = vnode;
    assert.invariant(data.class === undefined, `Engine Error: vnode.data.class should be undefined for ${vm}.`);
    let { className, classMap } = data;
    if (isUndefined(className) && isUndefined(classMap) && isUndefined(vm)) {
        return;
    }

    // split className, and make it a map object, this is needed in case the consumer of
    // the component provides a computed value, e.g.: `<x class={computedClassname}>`.
    // In this
    if (className) {
        assert.invariant(!classMap, `Compiler Error: vnode.data.classMap cannot be present when vnode.data.className is defined for ${vm}.`);
        classMap = getMapFromClassName(className);
    }

    let cmpClassMap;
    if (vm) {
        cmpClassMap = vm.cmpClasses;
    }
    if (classMap || cmpClassMap) {
        // computing the mashup between className (computed), classMap, and cmpClassMap (from component)
        data.class = assign({}, classMap, cmpClassMap);
    }
}

export default {
    create: syncClassNames,
    update: syncClassNames,
};
