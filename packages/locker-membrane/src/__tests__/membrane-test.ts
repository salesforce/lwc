import assert from 'power-assert';
import { Membrane } from './../membrane';


describe('Membrane', function () {
    describe('distortions', function () {
        it('should call distortion handler when piercing', function () {
            const distortion = jest.fn();
            const membrane = new Membrane(distortion);
            membrane.inject({});
            assert(distortion.mock.calls.length === 1);
        });
        it('should unwrap value when setting', function () {
            const dry: any = {};
            const bar = {};
            const distortion = (v) => v;
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(dry);
            wet.foo = bar;
            assert(dry.foo === bar);
        });
        it('should unwrap has correctly', function () {
            const distortion = (v) => v;
            const membrane = new Membrane(distortion);
            const foo = {
                bar: {}
            };

            const wet = membrane.inject(foo);
            expect('foo' in wet);
        });
        it('should apply distortions when getting value', function () {
            const rv = {};
            const distorted = {};
            function distortion (value) {
                if (value === rv) {
                    return distorted;
                }
                return value;
            }
            const membrane = new Membrane(distortion);
            const wet = membrane.inject({
                foo: rv
            });
            assert(wet.foo === membrane.inject(distorted));
        });
        it('should apply distortions when invoking function', function () {
            const rv = {};
            const distorted = {};
            function distortion (value) {
                if (value === rv) {
                    return distorted;
                }
                return value;
            }
            const membrane = new Membrane(distortion);
            const wet = membrane.inject({
                foo: function () {
                    return rv;
                }
            });
            assert(wet.foo() === membrane.inject(distorted));
        });

        it('should call function with correct arguments and context', function () {
            const distortion = (v) => v;
            const membrane = new Membrane(distortion);
            let mockThisArg;
            const originalObject = {
                arg: {},
                foo: jest.fn(function () {
                    mockThisArg = this;
                })
            };

            const wet = membrane.inject(originalObject);
            wet.foo(wet.arg);
            assert(originalObject.foo.mock.calls[0][0] !== wet.arg);
            assert(originalObject.foo.mock.calls[0][0] === originalObject.arg);
            assert(mockThisArg !== wet);
            assert(mockThisArg === originalObject);
        });
        it('should invoke constructor with correct arguments and context', function () {
            const distortion = (v) => v;
            const membrane = new Membrane(distortion);
            const instance = {};
            let mockArg;
            function Ctor (arg) {
                mockArg = arg;
                return instance;
            }
            const WetCtor = membrane.inject(Ctor);
            const arg = {};
            const wetArg = membrane.inject(arg);
            const value = new WetCtor(wetArg);
            assert(value === membrane.inject(instance));
            assert(mockArg === arg);
        });
        it('should distort constructor return value', function () {
            const mockInstance = {};
            const arg = {};
            function distortion (v) {
                if (v instanceof Ctor) {
                    return mockInstance;
                }

                if (v === arg) {
                    return mockArg;
                }

                return v;
            }
            const membrane = new Membrane(distortion);
            let mockArg;
            function Ctor (arg) {
                mockArg = arg;
            }
            const WetCtor = membrane.inject(Ctor);
            const wetArg = membrane.inject(arg);
            const value = new WetCtor(wetArg);
            assert(value === membrane.inject(mockInstance));
        });
        it('should handle wrapping getters', function () {
            const obj = {};
            const value = {};
            function getter () {
                return value;
            }
            Object.defineProperty(obj, 'foo', {
                get: getter,
                enumerable: true,
                configurable: true
            });

            const distortion = (v) => v;
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(obj);
            const descriptor = Object.getOwnPropertyDescriptor(wet, 'foo');
            assert(descriptor.get === membrane.inject(getter));
            assert(descriptor.get() !== value);
            assert(descriptor.get() === membrane.inject(value));
        });

        it('should handle setting values correctly', function () {
            const obj = {
                value: {}
            };
            let setterArg;
            let setterThis;
            Object.defineProperty(obj, 'foo', {
                set: function (arg) {
                    setterArg = arg;
                    setterThis = this;
                },
                enumerable: true,
                configurable: true
            });

            const distortion = (v) => v;
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(obj);
            wet.foo = wet.value;
            assert(setterArg === obj.value);
            assert(setterThis === obj);
        });

        it('should handle wrapping setters', function () {
            const obj = {
                prop: {}
            };
            const setMock = jest.fn();
            Object.defineProperty(obj, 'foo', {
                set: setMock,
                enumerable: true,
                configurable: true
            });

            const distortion = (v) => v;
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(obj);
            const descriptor = Object.getOwnPropertyDescriptor(wet, 'foo');
            descriptor.set(wet.prop);
            assert(setMock.mock.calls[0][0] === obj.prop);
            assert(setMock.mock.calls[0][0] !== wet.prop);
        });
    });

    describe('#inject', () => {
        let membrane;

        beforeEach(() => {
            membrane = new Membrane((v) => v);
        });

        it('should always return the same proxy', () => {
            const o = { x: 1 };
            const first = membrane.inject(o);
            const second = membrane.inject(o);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should never rewrap a previously produced proxy', () => {
            const o = { x: 1 };
            const first = membrane.inject(o);
            const second = membrane.inject(first);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should rewrap unknown proxy', () => {
            const o = { x: 1 };
            const first = new Proxy(o, {});
            const second = membrane.inject(first);
            assert(first.x === second.x);
            assert(first !== second);
        });
        it('should handle frozen objects correctly', () => {
            const o = Object.freeze({
                foo: {}
            });
            const property = membrane.inject(o);
            expect(() => {
                property.foo;
            }).not.toThrow();
        });
        it('should handle freezing proxy correctly', function () {
            const o = { foo: 'bar' };
            const property = membrane.inject(o);
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
            const property = membrane.inject(a);
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
            const property = membrane.inject(obj);
            const desc = Object.getOwnPropertyDescriptor(property, 'foo');
            assert(membrane.inject(desc.get()) === property.foo);
        });
        it('should handle has correctly', function () {
            var obj = {
                foo: 'bar'
            };
            const property = membrane.inject(obj);
            assert('foo' in property);
        });
        it('should delete writable properties correctly', function () {
            var obj = [{ foo: 'bar' }];
            const property = membrane.inject(obj);
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
            const wrapped = membrane.inject(obj);
            assert(Object.isExtensible(wrapped) === true);
        });
        it('should handle preventExtensions correctly', function () {
            const obj = {
                foo: 'bar'
            };
            const property = membrane.inject(obj);

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
            const property = membrane.inject(obj);
            Object.defineProperty(property, 'hello', {
                value: 'world'
            });
            assert(property.hello === 'world');
        });
        it('should handle defineProperty correctly when descriptor is non-configurable', function () {
            const obj = {
                foo: 'bar'
            };
            const wet = membrane.inject(obj);
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
            const wet = membrane.inject(obj);
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
            const wet = membrane.inject(obj);
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
            const wet = membrane.inject(obj);
            Object.defineProperty(wet, 'hello', {
                value: 'world',
                configurable: false
            });

            expect(() => {
                Object.preventExtensions(wet);
            }).not.toThrow();
        });
    });
});
