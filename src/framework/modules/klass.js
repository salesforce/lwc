import assert from "../assert.js";

function updateClass (oldVnode: VNode, vnode: VNode) {
    const elm = vnode.elm;
    const oldClass = oldVnode.data.class;
    const klass = vnode.data.class;

    if (klass !== oldClass) {
        assert.block(() => {
            if (elm.className === (klass || '')) {
                console.warn(`unneccessary update of element ${elm}, property className for ${vnode}.`);
            }
        });
        elm.className = klass || '';
    }
}

export default {
    create: updateClass,
    update: updateClass
}
