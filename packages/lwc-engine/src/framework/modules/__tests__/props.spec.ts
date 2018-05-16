import "../../patch"; // TODO: there is some wierd issue with the order of imports that break this test is this is not running first
import target from '../props';

describe('module/props', () => {

    it('should not set the input element title when the new value matches (reconcilation)', () => {
        const elm = {};
        let read = 0;
        Object.defineProperty(elm, 'title', {
            get: () => {
                read += 1;
                return "new title";
            },
            set: () => { throw new Error('setter for input.title was called accidentaly'); },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { data: { props: { title: "old title" } } };
        const newVnode = { data: { props: { title: "old title" } }, elm };

        target.update(oldVnode, newVnode);
        expect(read).toBe(0);
        expect(elm.title).toBe("new title");
    });

    it('should set the input element value when the new value matches if it is not match the elm.value (especial reconcilation)', () => {
        const elm = {};
        Object.defineProperty(elm, 'value', {
            value: "old value",
            enumerable: true,
            writable: true,
        });
        const oldVnode = { data: { props: { value: "new value" } } };
        const newVnode = { data: { props: { value: "new value" } }, elm };

        expect(elm.value).toBe('old value');
        // value PropertyKey is considered especial, and even if the old tracked value is equal to the new tracked value
        // we still check against the element's corresponding value to be sure.
        target.update(oldVnode, newVnode);
        expect(elm.value).toBe("new value");
    });

    it('should set the input element checked when the new checked matches if it is not match the elm.checked (especial reconcilation)', () => {
        const elm = {};
        Object.defineProperty(elm, 'checked', {
            value: "old checked",
            enumerable: true,
            writable: true,
        });
        const oldVnode = { data: { props: { checked: "new checked" } } };
        const newVnode = { data: { props: { checked: "new checked" } }, elm };

        expect(elm.checked).toBe('old checked');
        // checked PropertyKey is considered especial, and even if the old tracked value is equal to the new tracked value
        // we still check against the element's corresponding value to be sure.
        target.update(oldVnode, newVnode);
        expect(elm.checked).toBe("new checked");
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
