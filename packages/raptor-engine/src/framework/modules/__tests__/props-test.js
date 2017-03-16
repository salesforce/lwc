import target from '../props';
import assert from 'power-assert';

describe('module/props.js', () => {

    it('should not set the input element value when the new value matches (reconcilation)', () => {
        const elm = {};
        let read = false;
        Object.defineProperty(elm, 'value', {
            get: () => {
                read = true;
                return "new value";
            },
            set: () => { throw new Error('setter for input.value was called accidentaly'); },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { data: { props: { value: "old value" } } };
        const newVnode = { data: { props: { value: "new value" } }, elm };

        target.update(oldVnode, newVnode);
        assert(read === true, 'input.value was not compared to props.value to avoid setting a new value');
        assert(elm.value === "new value");
    });

    it('should set the input element value when the new value does not match (reconcilation)', () => {
        const elm = {};
        let v = "user input";
        Object.defineProperty(elm, 'value', {
            get: () => {
                return v;
            },
            set: (value) => {
                v = value;
            },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { data: { props: { value: "old value" } } };
        const newVnode = { data: { props: { value: "new value" } }, elm };

        target.update(oldVnode, newVnode);
        assert(v === "new value");
        assert(elm.value === "new value");
    });

    it('should not touch the element when the values are the same', () => {
        const elm = document.createElement('div');
        Object.defineProperty(elm, 'foo', {
            get: () => { throw new Error('getter for element.foo was called accidentaly'); },
            set: () => { throw new Error('setter for element.foo was called accidentaly'); },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { data: { props: { foo: 1 } } };
        const newVnode = { data: { props: { foo: 1 } }, elm };

        target.update(oldVnode, newVnode);
        assert(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo') !== undefined);
    });

    it('should allow undefined value in props', () => {
        const elm = document.createElement('div');
        elm.foo = null;
        const oldVnode = { data: { props: { foo: null } } };
        const newVnode = { data: { props: { foo: undefined } }, elm };

        target.update(oldVnode, newVnode);
        assert(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo') !== undefined);
    });

    it('should prevent deleting element when a falsy value will be added', () => {
        const elm = document.createElement('div');
        Object.defineProperty(elm, 'foo', {
            value: 1,
            configurable: false,
            writable: true,
            enumerable: true
        });
        elm.foo = 1;
        const oldVnode = { data: { props: { foo: 1 } } };
        const newVnode = { data: { props: { foo: undefined } }, elm };

        target.update(oldVnode, newVnode);
        assert(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo') !== undefined);
        assert(newVnode.elm.foo === undefined);
    });

    it('should not attempt to delete property from a root element', () => {
        const elm = document.createElement('div');
        Object.defineProperty(elm, 'foo', {
            value: 1,
            configurable: false,
            writable: true,
            enumerable: true
        });
        const oldVnode = { data: { props: { foo: 1 } } };
        const newVnode = { data: { props: {} }, elm, isRoot: true };

        target.update(oldVnode, newVnode);
        assert.equal(newVnode.elm.foo, undefined);
    });

});
