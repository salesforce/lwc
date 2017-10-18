import { Proxy } from "../main";

describe('Proxy', () => {
    describe('.instanceOfKey', () => {
        it('should return true when left is instance of right', function () {
            const instance = new Set();
            expect(Proxy.instanceOfKey(instance, Set)).toBe(true);
        });

        it('should return true when left is grandchild of right', function () {
            class Foo {}
            class Sub extends Foo {}
            const instance = new Sub();
            expect(Proxy.instanceOfKey(instance, Foo)).toBe(true);
        });

        it('should return same hasInstance function on proxy', function () {
            class Foo {}
            const proxy = new Proxy(Foo, {});
            expect(proxy[Symbol.hasInstance]).toBe(proxy[Symbol.hasInstance]);
        });

        it('should return false when left is not instance of right', function () {
            expect(Proxy.instanceOfKey({}, Set)).toBe(false);
        });

        it('should return true when left is proxy', function () {
            const instance = new Set();
            const proxy = new Proxy(instance, {});
            expect(Proxy.instanceOfKey(proxy, Set)).toBe(true);
        });

        it('should return true when left is proxy and grandchild', function () {
            class Foo {}
            class Sub extends Foo {}
            const instance = new Sub();
            const proxy = new Proxy(instance, {});
            expect(Proxy.instanceOfKey(proxy, Sub)).toBe(true);
        });

        it('should return false when left is proxy and not instance', function () {
            const instance = new Set();
            const proxy = new Proxy(instance, {});
            expect(Proxy.instanceOfKey(proxy, Map)).toBe(false);
        });

        it('should return true when right is proxy', function () {
            const ProxySet = new Proxy(Set, {});
            const instance = new Set();
            expect(Proxy.instanceOfKey(instance, ProxySet)).toBe(true);
        });

        it('should return false when right is proxy and not instance', function () {
            const Type = new Proxy(Set, {});
            const instance = new Map();
            expect(Proxy.instanceOfKey(instance, Type)).toBe(false);
        });

        it('should return true when left and right are proxies', function () {
            const Type = new Proxy(Set, {});
            const instance = new Proxy(new Set(), {});
            expect(Proxy.instanceOfKey(instance, Type)).toBe(true);
        });

        it('should return true when left and right are proxies and not instance', function () {
            const Type = new Proxy(Set, {});
            const instance = new Proxy(new Map(), {});
            expect(Proxy.instanceOfKey(instance, Type)).toBe(false);
        });

        it('should return false if handler returns false in symbolHasInstance', function () {
            let hasInstanceCalled = false;
            class Foo {}
            const Type = new Proxy(Foo, {
                get: function (target, key) {
                    if (key === Symbol.hasInstance) {
                        return function () {
                            hasInstanceCalled = true;
                            return false;
                        }
                    }
                    return target[key];
                }
            });
            const instance = new Foo();
            const isInstance = Proxy.instanceOfKey(instance, Type);
            expect(hasInstanceCalled).toBe(true);
            expect(isInstance).toBe(false);
        });

        it('should return true if handler returns true in symbolHasInstance', function () {
            class Foo {}
            const Type = new Proxy(Set, {
                get: function (target, key) {
                    if (key === Symbol.hasInstance) {
                        return function () {
                            return true;
                        }
                    }
                    return target[key];
                }
            });
            const instance = new Foo();
            const isInstance = Proxy.instanceOfKey(instance, Type);
            expect(isInstance).toBe(true);
        });

        it('should return call symbolHasInstance with correct context', function () {
            class Foo {}
            let context;
            const Type = new Proxy(Set, {
                get: function (target, key) {
                    if (key === Symbol.hasInstance) {
                        return function () {
                            context = this;
                            return true;
                        }
                    }
                    return target[key];
                }
            });
            const instance = new Foo();
            Proxy.instanceOfKey(instance, Type);
            expect(context).toBe(Type);
        });

        it('should return true when shadowTarget is instanceof Foo', function () {
            class Foo {}
            const shadow = {};
            const target = new Foo();
            const proxy = new Proxy(shadow, {
                getPrototypeOf() {
                    return Object.getPrototypeOf(target);
                }
            });
            expect(Proxy.instanceOfKey(proxy, Foo)).toBe(true);
        });

        it('should return true when instance is instanceof ShadowTarget', function () {
            class OriginalTarget {}
            const shadow = function () {};
            const ProxyCtor = new Proxy(shadow, {
                get(target, key) {
                    return OriginalTarget[key];
                },
                construct(targetFn, argumentsList) {
                    return new OriginalTarget(...argumentsList);
                }
            });
            const instance = new ProxyCtor();
            expect(Proxy.instanceOfKey(instance, OriginalTarget)).toBe(true);
            expect(Proxy.instanceOfKey(instance, ProxyCtor)).toBe(true);
        });
    });

    describe('.inKey', () => {
        describe('When given proxy', function () {
            it('should correctly report if key is in object', function () {
                const proxy = new Proxy({foo:'bar'}, {});
                expect(Proxy.inKey(proxy, 'foo')).toBe(true);
            });

            it('should correctly report if key is not in object', function () {
                const proxy = new Proxy({foo:'bar'}, {});
                expect(Proxy.inKey(proxy, 'missing')).toBe(false);
            });

            it('should respect result from proxy handler', function () {
                const proxy = new Proxy({foo:'bar'}, {
                    has: function () {
                        return true;
                    }
                });
                expect(Proxy.inKey(proxy, 'missing')).toBe(true);
            });
        });

        describe('When given plain object', function () {
            it('should correctly report if key is in object', function () {
                const object = {foo:'bar'};
                expect(Proxy.inKey(object, 'foo')).toBe(true);
            });

            it('should correctly report if key is not in object', function () {
                const object = {foo:'bar'};
                expect(Proxy.inKey(object, 'missing')).toBe(false);
            });
        });
    });

    describe('.callKey', () => {

        it('should preserve the context on regular objects', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            };
            Proxy.callKey(o.foo, 'bar', 1, 2);
            expect(context).toBe(o.foo);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should preserve context on membranes', () => {
            let context, args;
            const o = new Proxy({
                foo: new Proxy({
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }, {})
            }, {});
            Proxy.callKey(Proxy.getKey(o, 'foo'), 'bar', 1, 2);
            expect(context).toBe(Proxy.getKey(o, 'foo'));
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should support .call', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            Proxy.callKey(o.foo.bar, 'call', o.foo, 1, 2);
            expect(context).toBe(o.foo);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should support .apply', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            Proxy.callKey(o.foo.bar, 'apply', o.foo, [1, 2]);
            expect(context).toBe(o.foo);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should support no arguments', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            Proxy.callKey(o.foo, 'bar');
            expect(context).toBe(o.foo);
            expect(args.length).toBe(0);
        });
    });
});
