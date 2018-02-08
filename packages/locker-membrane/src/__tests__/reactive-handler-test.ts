import { ReactiveMembrane } from './../main';

describe('ReactiveHandler', () => {
    it('should always return the same proxy', () => {
        const o = { x: 1 };
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const first = target.getReactiveProxy(o);
        const second = target.getReactiveProxy(o);
        expect(first.x).toBe(second.x);
        expect(first).toBe(second);
    });
    it('should not try to make date object reactive', function() {
        const date = new Date();
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const state = target.getReactiveProxy({});
        state.date = date;
        expect(state.date).toBe(date);
    });
    it('should not try to make inherited object reactive', function() {
        const foo = Object.create({});
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const state = target.getReactiveProxy({});
        state.foo = foo;
        expect(state.foo).toBe(foo);
    });
    it('should never rewrap a previously produced proxy', () => {
        const o = { x: 1 };
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const first = target.getReactiveProxy(o);
        const second = target.getReactiveProxy(first);
        expect(first.x).toBe(second.x);
        expect(first).toBe(second);
    });
    it('should rewrap unknown proxy', () => {
        const o = { x: 1 };
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const first = new Proxy(o, {});
        const second = target.getReactiveProxy(first);
        expect(first).not.toBe(second);
    });
    it('should handle frozen objects correctly', () => {
        const o = Object.freeze({
            foo: {}
        });
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const property = target.getReactiveProxy(o);
        expect(() => {
            property.foo;
        }).not.toThrow();
    });
    it('should handle freezing proxy correctly', function() {
        const o = { foo: 'bar' };
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const property = target.getReactiveProxy(o);
        expect(() => {
            Object.freeze(property);
        }).not.toThrow();
    });
    it('should maintain equality', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const a = {
            foo: {
                self: null
            }
        };

        a.foo.self = a;

        const property = target.getReactiveProxy(a);
        expect(property.foo.self).toBe(property);
    });
    it('should understand property desc with getter', function() {
        const target = new ReactiveMembrane({
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

        const property = target.getReactiveProxy(obj);
        const desc = Object.getOwnPropertyDescriptor(property, 'foo');
        expect(target.getReactiveProxy(desc.get())).toBe(property.foo);
    });
    it('should handle has correctly', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const property = target.getReactiveProxy(obj);
        expect('foo' in property);
    });
    it('should delete writable properties correctly', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = [{ foo: 'bar' }];

        const property = target.getReactiveProxy(obj);
        const result = delete property[0];
        expect(!(0 in property));
        expect(result);
    });
    it('should handle extensible correctly when target is extensible', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const hello = {
            hello: 'world'
        };

        const obj = {
            hello
        };

        const wrapped = target.getReactiveProxy(obj);
        expect(Object.isExtensible(wrapped));
    });
    it('should handle preventExtensions correctly', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };
        const property = target.getReactiveProxy(obj);

        expect(() => {
            Object.preventExtensions(property);
        }).not.toThrow();

        expect(() => {
            property.nextValue = 'newvalue';
        }).toThrow();

        expect(property.foo).toBe('bar');
    });
    it('should handle defineProperty correctly', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const property = target.getReactiveProxy(obj);
        Object.defineProperty(property, 'hello', {
            value: 'world'
        });
        expect(property.hello).toBe('world');
    });
    it('should assign correct value on original object with defineProperty correctly', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const other = {};
        const obj = {
            foo: 'bar',
            other
        };

        const reactive = target.getReactiveProxy(obj);
        Object.defineProperty(reactive, 'nonreactive', {
            value: reactive.other
        });
        expect(obj.nonreactive).toBe(obj.other);
    });
    it('should handle defineProperty correctly with undefined non-configurable descriptor', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const property = target.getReactiveProxy(obj);
        Object.defineProperty(property, 'hello', {
            value: undefined,
            configurable: false
        });
        expect(property.hello).toBe(undefined);
    });
    it('should handle defineProperty correctly when descriptor is non-configurable', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const wet = target.getReactiveProxy(obj);
        Object.defineProperty(wet, 'hello', {
            value: 'world',
            configurable: false
        });

        expect(wet.hello).toBe('world');
    });
    it('should not allow deleting non-configurable property', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const wet = target.getReactiveProxy(obj);
        Object.defineProperty(wet, 'hello', {
            value: 'world',
            configurable: false
        });

        expect(() => {
            delete wet.hello;
        }).toThrow();
    });
    it('should not allow re-defining non-configurable property', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            foo: 'bar'
        };

        const wet = target.getReactiveProxy(obj);
        Object.defineProperty(wet, 'hello', {
            value: 'world',
            configurable: false
        });

        expect(() => {
            Object.defineProperty(wet, 'hello', {
                value: 'world',
                configurable: true
            });
        }).toThrow();
    });
    it('should handle preventExtensions', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            nested: {
                foo: 'bar'
            }
        };

        const wet = target.getReactiveProxy(obj);
        Object.defineProperty(wet, 'hello', {
            value: 'world',
            configurable: false
        });

        expect(() => {
            Object.preventExtensions(wet);
        }).not.toThrow();
    });
    it('should handle preventExtensions when original target has non-configurable property', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {};
        const nested = {};
        const handler = {};
        Object.defineProperty(obj, 'foo', {
            value: {
                nested
            },
            enumerable: true,
            configurable: false,
            writable: false
        });

        const property = target.getReactiveProxy(obj);
        Object.preventExtensions(property);
        expect(property.foo.nested).toBe(target.getReactiveProxy(nested));
    });
    it('should not throw an exception when preventExtensions is called on proxy and property is accessed', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = [
            { text: 'Learn JavaScript' },
            { text: 'Learn Raptor' },
            { text: 'Build something awesome' }
        ];
        const proxy = target.getReactiveProxy(todos);
        Object.preventExtensions(proxy);
        expect(() => {
            proxy[0];
        }).not.toThrow();
    });
    it('should not throw an exception when array proxy is frozen and property is accessed', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = [
            { text: 'Learn JavaScript' },
            { text: 'Learn Raptor' },
            { text: 'Build something awesome' }
        ];
        const proxy = target.getReactiveProxy(todos);
        Object.freeze(proxy);
        expect(() => {
            proxy[0];
        }).not.toThrow();
    });

    it('should not throw an exception when object proxy is frozen and property is accessed', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = {
            first: { text: 'Learn JavaScript' }
        };
        const proxy = target.getReactiveProxy(todos);
        Object.freeze(proxy);
        expect(() => {
            proxy.first;
        }).not.toThrow();
        expect(proxy.first).toEqual(todos.first);
    });

    it('should not throw an exception when object proxy is frozen and property with undefined value is accessed', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = {
            first: undefined
        };
        const proxy = target.getReactiveProxy(todos);
        Object.freeze(proxy);
        expect(() => {
            proxy.first;
        }).not.toThrow();
        expect(proxy.first).toEqual(todos.first);
    });

    it('should not throw an exception when object proxy is frozen and property with null value is accessed', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = {
            first: null
        };
        const proxy = target.getReactiveProxy(todos);
        Object.freeze(proxy);
        expect(() => {
            proxy.first;
        }).not.toThrow();
        expect(proxy.first).toEqual(todos.first);
    });

    it('should not throw an exception when object proxy is frozen and property with getter is accessed', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = {};
        Object.defineProperty(todos, 'first', {
            get() {
                return { text: 'Learn JavaScript' };
            }
        });
        const proxy = target.getReactiveProxy(todos);
        Object.freeze(proxy);
        expect(() => {
            proxy.first;
        }).not.toThrow();
        expect(proxy.first).toEqual({ text: 'Learn JavaScript' });
    });
    it('should not throw when using hasOwnProperty on nested frozen property', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = { frozen: { foo: { bar: true } } };
        const proxy = target.getReactiveProxy(obj);
        Object.freeze(proxy.frozen);
        expect(() => {
            Object.prototype.hasOwnProperty.call(proxy, 'frozen');
            Object.prototype.hasOwnProperty.call(proxy.frozen, 'foo');
        }).not.toThrow();
    });
    it('should not throw when using hasOwnProperty on frozen property', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = { foo: 'bar' };
        const proxy = target.getReactiveProxy(obj);
        Object.defineProperty(proxy, 'foo', {
            value: '',
            configurable: false,
            writable: false
        });
        expect(() => {
            Object.prototype.hasOwnProperty.call(proxy, 'foo');
        }).not.toThrow();
    });
    it('should handle defineProperty with writable false and undefined value', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = {};
        Object.defineProperty(todos, 'first', {
            value: 'foo',
            configurable: true
        });
        const proxy = target.getReactiveProxy(todos);
        Object.defineProperty(proxy, 'first', {
            value: undefined,
            writable: false
        });
        expect(proxy.first).toEqual(undefined);
    });
    it('should handle defineProperty for getter with writable false and no value', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const todos = {};
        Object.defineProperty(todos, 'first', {
            get() {
                return { text: 'Learn JavaScript' };
            },
            configurable: true
        });
        const proxy = target.getReactiveProxy(todos);
        Object.defineProperty(proxy, 'first', {
            writable: false
        });
        expect(proxy.first).toEqual(undefined);
    });
    it('should freeze objects correctly when object has symbols', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const symValue = { sym: 'value' };
        const obj = {
            foo: 'bar',
            [sym]: symValue
        };
        const proxy = target.getReactiveProxy(obj);
        Object.freeze(proxy);
        expect(proxy[sym]).toEqual(symValue);
    });
    it('should handle Object.getOwnPropertyNames correctly', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const obj = {
            a: 'b'
        };
        const proxy = target.getReactiveProxy(obj);
        expect(Object.getOwnPropertyNames(proxy)).toEqual(['a']);
    });
    it('should handle Object.getOwnPropertyNames when object has symbol', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            a: 'b',
            [sym]: 'symbol'
        };
        const proxy = target.getReactiveProxy(obj);
        expect(Object.getOwnPropertyNames(proxy)).toEqual(['a']);
    });
    it('should handle Object.getOwnPropertySymbols when object has symbol', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            [sym]: 'symbol'
        };
        const proxy = target.getReactiveProxy(obj);
        expect(Object.getOwnPropertySymbols(proxy)).toEqual([sym]);
    });
    it('should handle Object.getOwnPropertySymbols when object has symbol and key', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            a: 'a',
            [sym]: 'symbol'
        };
        const proxy = target.getReactiveProxy(obj);
        expect(Object.getOwnPropertySymbols(proxy)).toEqual([sym]);
    });
    it('should handle Object.keys when object has symbol and key', function() {
        const target = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });
        const sym = Symbol();
        const obj = {
            a: 'a',
            [sym]: 'symbol'
        };
        const proxy = target.getReactiveProxy(obj);
        expect(Object.keys(proxy)).toEqual(['a']);
    });

    it('should maintain equality', () => {
        const membrane = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const obj = {};
        expect(membrane.getReactiveProxy(obj)).toBe(membrane.getReactiveProxy(obj));
    });

    it('should allow deep mutations', () => {
        const membrane = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: () => {},
        });

        const obj = membrane.getReactiveProxy({});
        expect(() => {
            obj.foo = 'bar';
        }).not.toThrowError();
    });

    it('should notify when changes occur', () => {
        const obj = {
            foo: 'bar',
        };
        const changeSpy = jest.fn();
        const membrane = new ReactiveMembrane({
            propertyMemberChange: changeSpy,
            propertyMemberAccess: () => {},
        });

        const wet = membrane.getReactiveProxy(obj);
        wet.foo = 'changed';
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(obj, 'foo');
    });

    it('should notify when deep changes occur', () => {
        const obj = {
            foo: {
                bar: 'baz',
            }
        };
        const changeSpy = jest.fn();
        const membrane = new ReactiveMembrane({
            propertyMemberChange: changeSpy,
            propertyMemberAccess: () => {},
        });

        const wet = membrane.getReactiveProxy(obj);
        wet.foo.bar = 'changed';
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(obj.foo, 'bar');
    });

    it('should notify when property is accessed', () => {
        const obj = {
            foo: 'bar',
        };
        const accessSpy = jest.fn();
        const membrane = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: accessSpy,
        });

        const wet = membrane.getReactiveProxy(obj);
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
        const membrane = new ReactiveMembrane({
            propertyMemberChange: () => {},
            propertyMemberAccess: accessSpy,
        });

        const wet = membrane.getReactiveProxy(obj);
        wet.foo.bar;
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(accessSpy).toHaveBeenLastCalledWith(obj.foo, 'bar');
    });
});