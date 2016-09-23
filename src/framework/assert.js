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
    element(element: Object) {
        assert.isTrue(element && 'Ctor' in element, `${element} is not an element.`)
        assert.isTrue(Array.isArray(element.children), `${element}.children most be an array of element instead of ${element.children}.`);
    },
    fail(msg: string) {
        throw new Error(msg);
    },
};

export default assert;
