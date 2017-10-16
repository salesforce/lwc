import { Membrane, unwrap } from './../membrane';

describe('Membrane', function () {
    describe('distortions', function () {
        it('should not call distortion handler when piercing', function () {
            const distortion = jest.fn();
            const membrane = new Membrane(distortion);
            membrane.inject({});
            expect(distortion.mock.calls.length).toBe(0);
        });
        it('should unwrap value when setting', function () {
            const dry: { foo?: any } = {};
            const bar = {};
            const distortion = (membrane: Membrane, v: any) => membrane.inject(v);
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(dry);
            wet.foo = bar;
            expect(dry.foo).toBe(bar);
        });
        it('should unwrap has correctly', function () {
            const distortion = (membrane: Membrane, v: any) => membrane.inject(v);
            const membrane = new Membrane(distortion);
            const foo = {
                bar: {}
            };

            const wet = membrane.inject(foo);
            expect('bar' in wet).toBe(true);
        });
        it('should apply distortions when getting value', function () {
            const rv = {};
            const distorted = {};
            function distortion (membrane: Membrane, value: any) {
                if (value === rv) {
                    return membrane.inject(distorted);
                }
                return membrane.inject(value);
            }
            const membrane = new Membrane(distortion);
            const wet = membrane.inject({
                foo: rv
            });
            expect(wet.foo).toBe(membrane.inject(distorted));
        });
        it('should apply distortions when invoking function', function () {
            const rv = {};
            const distorted = {};
            function distortion (membrane: Membrane, value: any) {
                if (value === rv) {
                    return membrane.inject(distorted);
                }
                return membrane.inject(value);
            }
            const membrane = new Membrane(distortion);
            const wet = membrane.inject({
                foo: function () {
                    return rv;
                }
            });
            expect(wet.foo()).toBe(membrane.inject(distorted));
        });
        it('should call function with correct arguments and context', function () {
            const distortion = (membrane: Membrane, v: any) => v;
            const membrane = new Membrane(distortion);
            let calledThis;
            let calledArg;
            function foo (this: any, arg: any) {
                calledArg = arg;
                calledThis = this;
            }
            const dryArg = {};
            const dryThis = {};
            const wetThis = membrane.inject(dryThis);
            const wetArg = membrane.inject(dryArg);
            const wetFoo = membrane.inject(foo);
            wetFoo.call(wetThis, wetArg);
            expect(calledArg).not.toBe(wetArg);
            expect(calledArg).toBe(dryArg);
            expect(calledThis).not.toBe(wetThis);
            expect(calledThis).toBe(dryThis);
        });
        it('should invoke constructor with correct arguments and context', function () {
            const distortion = (membrane: Membrane, v: any) => membrane.inject(v);
            const membrane = new Membrane(distortion);
            const instance = {};
            let mockArg;
            function Ctor (arg: any) {
                mockArg = arg;
                return instance;
            }
            const WetCtor = membrane.inject(Ctor);
            const arg = {};
            const wetArg = membrane.inject(arg);
            const value = new WetCtor(wetArg);
            expect(value).toBe(membrane.inject(instance));
            expect(mockArg).toBe(arg);
        });
        it('should distort constructor return value', function () {
            const mockInstance = {};
            const arg = {};
            function distortion (membrane: Membrane, v: any) {
                if (v instanceof Ctor) {
                    return membrane.inject(mockInstance);
                }
                return membrane.inject(v);
            }
            const membrane = new Membrane(distortion);
            function Ctor () {}
            const WetCtor = membrane.inject(Ctor);
            const wetArg = membrane.inject(arg);
            const value = new WetCtor(wetArg);
            expect(value).toBe(membrane.inject(mockInstance));
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

            const distortion = (membrane: Membrane, v: any) => membrane.inject(v);
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(obj);
            const descriptor = Object.getOwnPropertyDescriptor(wet, 'foo');
            expect(descriptor.get).toBe(membrane.inject(getter));
            const getterValue = (descriptor.get as any)();
            expect(getterValue).not.toBe(value);
            expect(getterValue).toBe(membrane.inject(value));
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

            const distortion = (membrane: Membrane, v: any) => membrane.inject(v);
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(obj);
            wet.foo = wet.value;
            expect(setterArg).toBe(obj.value);
            expect(setterThis).toBe(obj);
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

            const distortion = (membrane: Membrane, v: any) => membrane.inject(v);
            const membrane = new Membrane(distortion);
            const wet = membrane.inject(obj);
            const descriptor = Object.getOwnPropertyDescriptor(wet, 'foo');
            (descriptor.set as any)(wet.prop);
            expect(setMock.mock.calls[0][0]).toBe(obj.prop);
            expect(setMock.mock.calls[0][0]).not.toBe(wet.prop);
        });
    });

    describe('#inject', () => {
        let membrane: Membrane;

        beforeEach(() => {
            membrane = new Membrane((membrane: Membrane, v: any) => membrane.inject(v));
        });

        it('should always return the same proxy', () => {
            const o = { x: 1 };
            const first = membrane.inject(o);
            const second = membrane.inject(o);
            expect(first.x).toBe(second.x);
            expect(first).toBe(second);
        });
        it('should never rewrap a previously produced proxy', () => {
            const o = { x: 1 };
            const first = membrane.inject(o);
            const second = membrane.inject(first);
            expect(first.x).toBe(second.x);
            expect(first).toBe(second);
        });
        it('should rewrap unknown proxy', () => {
            const o = { x: 1 };
            const first = new Proxy(o, {});
            const second = membrane.inject(first);
            expect(first).not.toBe(second);
            expect(unwrap(second)).toBe(first);
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

            a.foo.self = a as any;
            const property = membrane.inject(a);
            expect(property.foo.self).toBe(property);
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
            expect((desc.get as any)()).toBe(property.foo);
        });
        it('should handle has correctly', function () {
            var obj = {
                foo: 'bar'
            };
            const property = membrane.inject(obj);
            expect('foo' in property).toBe(true);
        });
        it('should delete writable properties correctly', function () {
            var obj = [{ foo: 'bar' }];
            const property = membrane.inject(obj);
            const result = delete property[0];
            expect(0 in property).toBe(false);
            expect(result).toBe(true);
        });
        it('should handle extensible correctly when target is extensible', function () {
            const hello = {
                hello: 'world'
            };
            const obj = {
                hello
            };
            const wrapped = membrane.inject(obj);
            expect(Object.isExtensible(wrapped)).toBe(true);
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

            expect(property.foo).toBe('bar');
        });
        it('should handle defineProperty correctly', function () {
            const obj = {
                foo: 'bar'
            };
            const property = membrane.inject(obj);
            Object.defineProperty(property, 'hello', {
                value: 'world'
            });
            expect(property.hello).toBe('world');
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

            expect(wet.hello).toBe('world');
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
