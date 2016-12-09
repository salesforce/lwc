import assert from "./assert.js";
import {
    isRendering,
} from "./invoker.js";

export function markVMAsDirty(vm: VM) {
    assert.vm(vm);
    const { flags } = vm;
    assert.isFalse(flags.isDirty, `markVMAsDirty(${vm}) should not be called when the componet is already dirty.`);
    assert.isFalse(isRendering, `markEntryAsDirty(${vm}) cannot be called during rendering.`);
    console.log(`${vm} was marked as dirty.`);
    flags.isDirty = true;
}
