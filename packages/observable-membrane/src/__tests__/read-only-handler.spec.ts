import { ReactiveMembrane } from './../reactive-membrane';

describe('ReadOnlyHandler', () => {
    it('should always return the same proxy', () => {
        const o = { x: 1 };
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const first = target.getReadOnlyProxy(o);
        const second = target.getReadOnlyProxy(o);
        expect(first.x).toBe(second.x);
        expect(first).toBe(second);
    });
    it('should never rewrap a previously produced proxy', () => {
        const o = { x: 1 };
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const first = target.getReadOnlyProxy(o);
        const second = target.getReadOnlyProxy(first);
        expect(first.x).toBe(second.x);
        expect(first).toBe(second);
    });
    it('should rewrap unknown proxy', () => {
        const o = { x: 1 };
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const first = new Proxy(o, {});
        const second = target.getReadOnlyProxy(first);
        expect(first).not.toBe(second);
    });
    it('should handle frozen objects correctly', () => {
        const o = Object.freeze({
            foo: {}
        });
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const property = target.getReadOnlyProxy(o);
        expect(() => {
            property.foo;
        }).not.toThrow();
    });
    it('should maintain equality', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const a = {
            foo: {
                self: null
            }
        };

        a.foo.self = a;

        const property = target.getReadOnlyProxy(a);
        expect(property.foo.self).toBe(property);
    });
    it('should understand property desc with getter', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const obj = {
            test: 2
        };
        const a = {
            hello: 'world'
        };
        Object.defineProperty(obj, 'foo', {
            get: function getter() {
                return a;
            },
            enumerable: true
        });

        const property = target.getReadOnlyProxy(obj);
        const desc = Object.getOwnPropertyDescriptor(property, 'foo');
        expect(target.getReadOnlyProxy(desc.get())).toBe(property.foo);
    });
    it('should handle has correctly', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const property = target.getReadOnlyProxy(obj);
        expect('foo' in property);
    });
    it('should throw when deleting', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = [{ foo: 'bar' }];

        const property = target.getReadOnlyProxy(obj);
        expect(() => {
            delete property[0];
        }).toThrow();
    });
    it('should handle extensible correctly when target is extensible', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const hello = {
            hello: 'world'
        };

        const obj = {
            hello
        };

        const wrapped = target.getReadOnlyProxy(obj);
        expect(Object.isExtensible(wrapped));
    });
    it('preventExtensions should throw', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };
        const property = target.getReadOnlyProxy(obj);

        expect(() => {
            Object.preventExtensions(property);
        }).toThrow();
    });
    it('defineProperty should throw', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const property = target.getReadOnlyProxy(obj);
        expect(() => {
            Object.defineProperty(property, 'hello', {
                value: 'world'
            });
        }).toThrow();
    });

    it('should handle Object.getOwnPropertyNames correctly', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            a: 'b'
        };
        const proxy = target.getReadOnlyProxy(obj);
        expect(Object.getOwnPropertyNames(proxy)).toEqual(['a']);
    });
    it('should handle Object.getOwnPropertyNames when object has symbol', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            a: 'b',
            [sym]: 'symbol'
        };
        const proxy = target.getReadOnlyProxy(obj);
        expect(Object.getOwnPropertyNames(proxy)).toEqual(['a']);
    });
    it('should handle Object.getOwnPropertySymbols when object has symbol', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            [sym]: 'symbol'
        };
        const proxy = target.getReadOnlyProxy(obj);
        expect(Object.getOwnPropertySymbols(proxy)).toEqual([sym]);
    });
    it('should handle Object.getOwnPropertySymbols when object has symbol and key', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            a: 'a',
            [sym]: 'symbol'
        };
        const proxy = target.getReadOnlyProxy(obj);
        expect(Object.getOwnPropertySymbols(proxy)).toEqual([sym]);
    });
    it('should handle Object.keys when object has symbol and key', function() {
        const target = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            a: 'a',
            [sym]: 'symbol'
        };
        const proxy = target.getReadOnlyProxy(obj);
        expect(Object.keys(proxy)).toEqual(['a']);
    });

    it('should maintain equality', () => {
        const membrane = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const obj = {};
        expect(membrane.getReadOnlyProxy(obj)).toBe(membrane.getReadOnlyProxy(obj));
    });

    it('should throw on deep mutations', () => {
        const membrane = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const obj = membrane.getReadOnlyProxy({});
        expect(() => {
            obj.foo = 'bar';
        }).toThrowError();
    });

    it('should notify when property is accessed', () => {
        const obj = {
            foo: 'bar',
        };
        const accessSpy = jest.fn();
        const membrane = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: accessSpy,
        });

        const wet = membrane.getReadOnlyProxy(obj);
        wet.foo;
        expect(accessSpy).toHaveBeenCalledTimes(1);
        expect(accessSpy).toHaveBeenCalledWith(obj, 'foo');
    });

    it('should notify when deep property is accessed', () => {
        const obj = {
            foo: {
                bar: 'baz',
            }
        };
        const accessSpy = jest.fn();
        const membrane = new ReactiveMembrane((value) => value, {
            propertyMemberChange: () => {},
            propertyMemberAccess: accessSpy,
        });

        const wet = membrane.getReadOnlyProxy(obj);
        wet.foo.bar;
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(accessSpy).toHaveBeenLastCalledWith(obj.foo, 'bar');
    });
});