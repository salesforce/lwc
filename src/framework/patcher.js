import assert from "./assert.js";

import className from "./modules/klass.js";
import componentCreation from "./modules/component-creation.js";
import componentState from "./modules/component-state.js";
import slotset from "./modules/slotset.js";
import shadowRootElement from "./modules/shadow-root-element.js";
import shadowRootFolded from "./modules/shadow-root-folded.js"; 
import props from "./modules/props.js"; 

import { init } from "snabbdom";
import attrs from "snabbdom/modules/attributes";
import style from "snabbdom/modules/style";
import dataset from "snabbdom/modules/dataset";
import on from "snabbdom/modules/eventlisteners";

export const patch = init([
    componentCreation,
    // these are all raptor specific plugins.
    componentState,
    slotset,
    shadowRootElement,
    shadowRootFolded,
    // at this point, raptor is done, and regular plugins
    // should be used to rehydrate the dom element.
    props,
    attrs,
    style,
    dataset,
    className,
    on,
]);

function rehydrate(vm: VM) {
    assert.vm(vm);
    const { cache } = vm;
    assert.isTrue(vm.elm instanceof HTMLElement && cache.prevNode, `rehydration can only happen after ${vm} was patched the first time.`);
    if (cache.isDirty) {
        patch(cache.prevNode, vm);
    }
    cache.isScheduled = false;
}

export function scheduleRehydration(vm: VM) {
    assert.vm(vm);
    const { cache } = vm;
    if (!cache.isScheduled) {
        cache.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch((error: Error) => {
            assert.fail(`Error attempting to rehydrate component ${vm}: ${error.message}`);
        });
    }
}
