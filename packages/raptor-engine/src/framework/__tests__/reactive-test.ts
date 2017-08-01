import * as target from '../reactive';
import assert from 'power-assert';

describe('reactive', function () {

    describe('#hookComponentLocalProperty()', function () {
        // TBD: mock for vm is needed here
    });

    describe('#isObservable', function () {
        it('should return true for plain objects', function () {
            const reactive = target.isObservable({});
            assert(reactive);
        });

        it('should return true for objects with null prototype', function () {
            const reactive = target.isObservable(Object.create(null));
            assert(reactive);
        });

        it('should return true for arrays', function () {
            const reactive = target.isObservable([]);
            assert(reactive);
        });

        it('should return false for functions', function () {
            const reactive = target.isObservable(function () {});
            assert(!reactive);
        });

        it('should return false for false', function () {
            const reactive = target.isObservable(false);
            assert(!reactive);
        });

        it('should return false for null', function () {
            const reactive = target.isObservable(false);
            assert(!reactive);
        });

        it('should return false for undefined', function () {
            const reactive = target.isObservable(false);
            assert(!reactive);
        });

        it('should return false for true', function () {
            const reactive = target.isObservable(true);
            assert(!reactive);
        });

        it('should return false for number', function () {
            const reactive = target.isObservable(1);
            assert(!reactive);
        });

        it('should return false for string', function () {
            const reactive = target.isObservable('foo');
            assert(!reactive);
        });

        it('should return false for extended objects', function () {
            const obj = Object.create({});
            const reactive = target.isObservable(obj);
            assert(!reactive);
        });
    });

    describe('#getReactiveProxy()', () => {
        it('should throw for non-object values', () => {
            assert.throws(() => target.getReactiveProxy(undefined), "undefined value");
            assert.throws(() => target.getReactiveProxy(""), "empty string value");
            assert.throws(() => target.getReactiveProxy(NaN), "NaN value");
            assert.throws(() => target.getReactiveProxy(function () {}));
            assert.throws(() => target.getReactiveProxy(1), "Number value");
        });
        it('should always return the same proxy', () => {
            const o = { x: 1 };
            const first = target.getReactiveProxy(o);
            const second = target.getReactiveProxy(o);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should not try to make date object reactive', function () {
            const date = new Date();
            const state = target.getReactiveProxy({});
            state.date = date;
            assert(state.date === date);
        });
        it('should not try to make inherited object reactive', function () {
            const foo = Object.create({});
            const state = target.getReactiveProxy({});
            state.foo = foo;
            assert(state.foo === foo);
        });
        it('should never rewrap a previously produced proxy', () => {
            const o = { x: 1 };
            const first = target.getReactiveProxy(o);
            const second = target.getReactiveProxy(first);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should rewrap unknown proxy', () => {
            const o = { x: 1 };
            const first = new Proxy(o, {});
            const second = target.getReactiveProxy(first);
            assert(first.x === second.x);
            assert(first !== second);
        });
        it('should handle frozen objects correctly', () => {
            const o = Object.freeze({
                foo: {}
            });
            const property = target.getReactiveProxy(o);
            expect(() => {
                property.foo;
            }).not.toThrow();
        });
        it('should handle freezing proxy correctly', function () {
            const o = { foo: 'bar' };
            const property = target.getReactiveProxy(o);
            expect(() => {
                Object.freeze(property);
            }).not.toThrow();
        });
        it('should maintain equality', function () {
            const a = {
                foo: {
                    self: null
                }
            };

            a.foo.self = a;

            const property = target.getReactiveProxy(a);
            assert(property.foo.self === property);
        });
        it('should understand property desc with getter', function () {
            const obj = {
                test: 2
            };
            const a = {
                hello: 'world'
            };
            Object.defineProperty(obj, 'foo', {
                get: function getter () {
                    return a;
                },
                enumerable: true
            });

            const property = target.getReactiveProxy(obj);
            const desc = Object.getOwnPropertyDescriptor(property, 'foo');
            assert(target.getReactiveProxy(desc.get()) === property.foo);
        });
        it('should handle has correctly', function () {
            var obj = {
                foo: 'bar'
            };

            const property = target.getReactiveProxy(obj);
            assert('foo' in property);
        });
        it('should delete writable properties correctly', function () {
            var obj = [{ foo: 'bar' }];

            const property = target.getReactiveProxy(obj);
            const result = delete property[0];
            assert(!(0 in property));
            assert(result);
        });
        it('should handle extensible correctly when target is extensible', function () {
            const hello = {
                hello: 'world'
            };

            const obj = {
                hello
            };

            const wrapped = target.getReactiveProxy(obj);
            assert(Object.isExtensible(wrapped) === true);
        });
        it('should handle preventExtensions correctly', function () {
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

            assert(property.foo === 'bar');
        });
        it('should handle defineProperty correctly', function () {
            const obj = {
                foo: 'bar'
            };

            const property = target.getReactiveProxy(obj);
            Object.defineProperty(property, 'hello', {
                value: 'world'
            });
            assert(property.hello === 'world');
        });
        it('should handle defineProperty correctly when descriptor is non-configurable', function () {
            const obj = {
                foo: 'bar'
            };

            const wet = target.getReactiveProxy(obj);
            Object.defineProperty(wet, 'hello', {
                value: 'world',
                configurable: false
            });

            assert(wet.hello === 'world');
        });
        it('should not allow deleting non-configurable property', function () {
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
        it('should not allow re-defining non-configurable property', function () {
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
        it('should handle preventExtensions', function () {
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
        it('should handle preventExtensions when original target has non-configurable property', function () {
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
            assert(property.foo.nested === target.getReactiveProxy(nested));
        });
    });
});
