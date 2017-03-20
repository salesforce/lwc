import assert from "./assert.js";
import { isArray } from "./language.js";

let nextTickCallbackQueue = undefined;

export function addCallbackToNextTick(callback: any) {
    assert.isTrue(typeof callback === 'function', `addCallbackToNextTick() can only accept a function callback as first argument instead of ${callback}`);
    if (!isArray(nextTickCallbackQueue)) {
        nextTickCallbackQueue = [];
        Promise.resolve(nextTickCallbackQueue).then((callbacks: Array<Callback>) => {
            assert.isTrue(isArray(callbacks), `${callbacks} must be the array of callbacks`);
            nextTickCallbackQueue = undefined;
            for (let i = 0, len = callbacks.length; i < len; i += 1) {
                callbacks[i]();
            }
        }).catch((error: Error) => {
            assert.fail(`Error attempting to execute internal engine callback in the next tick: ${error.message}`);
        });
    }
    nextTickCallbackQueue.push(callback);
}
