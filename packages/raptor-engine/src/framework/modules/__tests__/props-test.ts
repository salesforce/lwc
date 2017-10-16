import target from '../props';

describe('module/props', () => {

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
        expect(read).toBe(true);
        expect(elm.value).toBe("new value");
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
        expect(v).toBe("new value");
        expect(elm.value).toBe("new value");
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
        expect(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo')).not.toBeUndefined();
    });

    it('should allow undefined value in props', () => {
        const elm = document.createElement('div');
        elm.foo = null;
        const oldVnode = { data: { props: { foo: null } } };
        const newVnode = { data: { props: { foo: undefined } }, elm };

        target.update(oldVnode, newVnode);
        expect(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo')).not.toBeUndefined();
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
        expect(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo')).not.toBeUndefined();
        expect(newVnode.elm.foo).toBeUndefined();
    });

});
