import assert from "../assert";
import { reactiveMembrane } from '../membrane';

// when used with exactly one argument, we assume it is a function invocation.
export default function readonly(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        // TODO: enable the usage of this function as @readonly decorator
        if (arguments.length !== 1) {
            assert.fail("@readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value.");
        }
    }
    return reactiveMembrane.getReadOnlyProxy(obj);
}
