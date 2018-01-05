window.Proxy.__COMPAT__ = true;

import Proxy from "../main";
import assert from 'power-assert';

describe('EcmaScript', () => {

    describe('intrinsics', () => {

        it('should support Arrays', () => {
            const array = [1, 2];
            const o = new Proxy(array, {});
            assert.strictEqual(Array.isArray(o), true);
            assert.strictEqual(Proxy.getKey(o, 'length'), 2);
            assert.strictEqual(Proxy.getKey(o, 0), 1);
            assert.strictEqual(Proxy.getKey(o, 1), 2);
            Proxy.setKey(o, '2', 3);
            assert.strictEqual(Proxy.getKey(o, 'length'), 3);
            assert.strictEqual(Proxy.getKey(o, 2), 3, 'expandos are not supported'); // expando
            Proxy.callKey(array, 'push', 3);
            expect(array.length).toBe(4);
            expect(Proxy.getKey(o, 'length')).toBe(4);
        });

        it('should support Arrays as iterators', () => {
            const array = [1, 2];
            const o = new Proxy(array, {});
            assert.deepEqual(Array.from(o), [1, 2]);
        });

        it('should correctly slice array', function () {
            const array = [1, 2, 3, 2];
            const proxy = new Proxy(array, {});

            expect(
                Proxy.callKey(proxy, 'slice', 2)
            ).toEqual([
                3,
                2
            ]);
        });

        it('should correctly report lastIndexOf', function () {
            const array = [1, 2, 3, 2];
            const proxy = new Proxy(array, {});

            expect(
                Proxy.callKey(proxy, 'lastIndexOf', 2)
            ).toBe(3);
        });

        it('should correctly join', function () {
            const array = [1, 2, 3];
            const proxy = new Proxy(array, {});

            expect(
                Proxy.callKey(proxy, 'join', '-')
            ).toBe('1-2-3');
        });

        it('should correctly report indexOf', function () {
            const array = [1, 2, 3];
            const proxy = new Proxy(array, {});

            expect(
                Proxy.callKey(proxy, 'indexOf', 2)
            ).toBe(1);

            expect(
                Proxy.callKey(proxy, 'indexOf', 'no')
            ).toBe(-1);
        });

        it('should correctly report includes', function () {
            const array = [1, 2, 3];
            const proxy = new Proxy(array, {});

            expect(
                Proxy.callKey(proxy, 'includes', 1)
            ).toBe(true);

            expect(
                Proxy.callKey(proxy, 'includes', 'no')
            ).toBe(false);
        });

        it('should correctly fill arrays', function () {
            const array = [1, 2, 3];
            const proxy = new Proxy(array, {});

            Proxy.callKey(proxy, 'fill', 'foo', 1);
            expect(proxy.length).toBe(3);
            expect(proxy[0]).toEqual(1);
            expect(proxy[1]).toEqual('foo');
            expect(proxy[2]).toEqual('foo');
            expect(Proxy.getKey(proxy, 0)).toEqual(1);
            expect(Proxy.getKey(proxy, 1)).toEqual('foo');
            expect(Proxy.getKey(proxy, 2)).toEqual('foo');
        });

        it('should correctly sort arrays', function () {
            const array = [2, 1, 3];
            const proxy = new Proxy(array, {});

            Proxy.callKey(proxy, 'sort', (a, b) => {
                return a > b;
            });
            expect(proxy.length).toBe(3);
            expect(proxy[0]).toEqual(1);
            expect(proxy[1]).toEqual(2);
            expect(proxy[2]).toEqual(3);
            expect(Proxy.getKey(proxy, 0)).toEqual(1);
            expect(Proxy.getKey(proxy, 1)).toEqual(2);
            expect(Proxy.getKey(proxy, 2)).toEqual(3);
        });

        it('should correctly shift arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});

            Proxy.callKey(proxy, 'shift');
            expect(proxy.length).toBe(1);
            expect(proxy[0]).toEqual(2);
            expect(proxy[1]).toEqual(undefined);
            expect(Proxy.getKey(proxy, 0)).toEqual(2);
            expect(Proxy.getKey(proxy, 1)).toEqual(undefined);
        });

        it('should correctly reverse arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});

            Proxy.callKey(proxy, 'reverse');
            expect(proxy.length).toBe(2);
            expect(proxy[0]).toEqual(2);
            expect(proxy[1]).toEqual(1);
            expect(Proxy.getKey(proxy, 0)).toEqual(2);
            expect(Proxy.getKey(proxy, 1)).toEqual(1);
        });

        it('should correctly pop arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});

            const result = Proxy.callKey(proxy, 'pop');
            expect(result).toBe(2);
            expect(proxy.length).toBe(1);
            expect(proxy[0]).toEqual(1);
            expect(proxy[1]).toEqual(undefined);
            expect(Proxy.getKey(proxy, 0)).toEqual(1);
            expect(Proxy.getKey(proxy, 1)).toEqual(undefined);
        });

        it('should correctly concat arrays', function () {
            const array = [1, 2];
            const other = [3, 4];
            const first = new Proxy(array, {});
            const second = new Proxy(other, {});

            const result = first.concat(second);
            expect(result.length).toBe(4);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(first.length).toBe(2);
            expect(second.length).toBe(2);
        });

        it('should use concat function returned by trap', function () {
            const array = [1, 2];
            let called = false;
            const proxy = new Proxy(array, {
                get(target, key) {
                    if (key === 'concat') {
                        return function () {
                            called = true;
                        }
                    }
                    return target[key];
                }
            })
            proxy.concat([2]);
            expect(called).toBe(true);
        });

        it('should correctly concat string arguments', function () {
            const array = [1, 2];
            const first = new Proxy(array, {});

            const result = first.concat('foo');
            expect(result.length).toBe(3);
            expect(result).toEqual([1, 2, 'foo']);
        });

        it('should correctly concat native arrays', function () {
            const array = [1, 2];

            const result = array.concat([3, 4]);
            expect(result.length).toBe(4);
            expect(result).toEqual([1, 2, 3, 4]);
        });

        it('should correctly concat a mix of compat proxy and arrays', function () {
            const array = [1, 2];
            const first = new Proxy(array, {});

            const result = first.concat([3, 4]);
            expect(result.length).toBe(4);
            expect(result).toEqual([1, 2, 3, 4]);
        });

        it('should concat arrays with get trap', function () {
            const array = [1, 2];
            const other = [3, 4];
            const first = new Proxy(array, {});
            const second = new Proxy(other, {
                get (target, key) {
                    if (key === 0) {
                        return 'asd';
                    }
                    return target[key];
                }
            });
            const result = first.concat(second);
            expect(result).toEqual([
                1, 2, 'asd', 4
            ])
        });

        it('should correctly concat multiple arrays', function () {
            const array = [1, 2];
            const other = [3, 4];
            const first = new Proxy(array, {});
            const second = new Proxy(other, {});
            const third = new Proxy([5, 6], {});

            const result = first.concat(second, third);
            expect(result.length).toBe(6);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('should corrently concat array when using prototype', function () {
            const array = [1, 2];
            const other = [3, 4];
            const first = new Proxy(array, {});
            const second = new Proxy(other, {});

            const result = Array.prototype.compatConcat.call(first, second);
            expect(result.length).toBe(4);
            expect(result).toEqual([1, 2, 3, 4]);
        });

        it('should correctly slice arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});
            Proxy.callKey(proxy, 'splice', 0, 1);
            expect([
                Proxy.getKey(proxy, 0),
                Proxy.getKey(proxy, 1),
                Proxy.getKey(proxy, 2)
            ]).toEqual([2, undefined, undefined]);
        });

        it('should correctly push arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});
            proxy.push(3);
            expect([
                Proxy.getKey(proxy, 0),
                Proxy.getKey(proxy, 1),
                Proxy.getKey(proxy, 2)
            ]).toEqual([1, 2, 3]);
            expect(proxy.length).toBe(3);
        });

        it('should be able to iterate through pushed arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});
            proxy.push(3);
            const args = [];

            Proxy.callKey(proxy, 'forEach', function (item) {
                args.push(item);
            });
            expect(args).toEqual([
                1, 2, 3
            ]);
        });

        it('should call get trap with length with using push', function () {
            const array = [1, 2];
            const keys = [];
            const proxy = new Proxy(array, {
                set (target, key) {
                    keys.push(key);
                    return true;
                }
            });

            proxy.push('hey');
            expect(keys.indexOf('length')).toBeGreaterThan(-1);
        });

        it('should correctly push native arrays', function () {
            const array = [1, 2];
            array.push(3);
            expect([
                Proxy.getKey(array, 0),
                Proxy.getKey(array, 1),
                Proxy.getKey(array, 2)
            ]).toEqual([1, 2, 3]);
            expect(array).toEqual([
                1, 2, 3
            ])
        });

        it('should use push function returned by trap', function () {
            const array = [1, 2];
            let called = false;
            const proxy = new Proxy(array, {
                get(target, key) {
                    if (key === 'push') {
                        return function () {
                            called = true;
                        }
                    }
                    return target[key];
                }
            })
            proxy.push(3);
            expect(called).toBe(true);
        });

        it('should corrently push into array when using prototype', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});

            Array.prototype.compatPush.call(proxy, 3, 4);

            expect(proxy.length).toBe(4);
            expect([
                Proxy.getKey(proxy, 0),
                Proxy.getKey(proxy, 1),
                Proxy.getKey(proxy, 2),
                Proxy.getKey(proxy, 3),
            ]).toEqual([1, 2, 3, 4]);
        });

        it('should access and set array values correctly', function () {
            const array = [];
            const proxy = new Proxy(array, {});
            Proxy.setKey(proxy, 1, 'a');
            expect(Proxy.getKey(proxy, 1)).toBe('a');
            Proxy.setKey(proxy, 0, 'b');
            expect(Proxy.getKey(proxy, 0)).toBe('b');
        });

        it('should correctly unshift arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});
            proxy.unshift(3);
            expect(proxy.length).toBe(3);
            const ret = proxy.unshift(10);
            expect(proxy.length).toBe(4);
            expect(ret).toBe(4);
            expect([
                Proxy.getKey(proxy, 0),
                Proxy.getKey(proxy, 1),
                Proxy.getKey(proxy, 2),
                Proxy.getKey(proxy, 3),
                Proxy.getKey(proxy, 4)
            ]).toEqual([10, 3, 1, 2, undefined]);
        });

        it('should use unshift function returned by trap', function () {
            const array = [1, 2];
            let called = false;
            const proxy = new Proxy(array, {
                get(target, key) {
                    if (key === 'unshift') {
                        return function () {
                            called = true;
                        }
                    }
                    return target[key];
                }
            })
            proxy.unshift(2);
            expect(called).toBe(true);
        });

        it('should allow arbitrary access to unshifted arrays', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});
            proxy.unshift(3);
            expect(proxy[0]).toBe(3);
            expect(proxy[1]).toBe(1);
            expect(proxy[2]).toBe(2);
        });

        it('should iterate through unshifted compat arrays correctly', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});
            let calls = [];
            proxy.unshift(3);
            Proxy.callKey(proxy, 'forEach', (i) => {
                calls.push(i);
            });
            expect(calls).toEqual([3, 1, 2]);
        });

        it('should corrently unshift when using prototype', function () {
            const array = [1, 2];
            const proxy = new Proxy(array, {});

            Array.prototype.compatUnshift.call(proxy, 0);

            expect(proxy.length).toBe(3);
            expect([
                Proxy.getKey(proxy, 0),
                Proxy.getKey(proxy, 1),
                Proxy.getKey(proxy, 2),
            ]).toEqual([0, 1, 2]);
        });

        it('should support iterable objects', () => {
            const iterable = {
                [Symbol.iterator]: function() {
                    return { // this is the iterator object, returning a single element, the string "bye"
                        next: function() {
                            if (this._first) {
                                this._first = false;
                                return { value: 'bye', done: false };
                            } else {
                                return { done: true };
                            }
                        },
                        _first: true
                    };
                }
            };
            const o = new Proxy(iterable, {});
            assert.deepEqual(Array.from(o), ['bye']);
        });

        it('should support Object.keys()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            Proxy.setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.compatKeys(o), ['x', 'y', 'z']);
        });

        it('Object.keys should not return non-enumerable keys', () => {
            const o = {
                foo: 'bar'
            };
            Object.defineProperty(o, 'hidden', {
                value: ''
            });
            const proxy = new Proxy(o, {});
            const keys = Object.compatKeys(proxy);
            expect(keys).toEqual(['foo']);
        });

        it('should support Object.getOwnPropertyNames()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            Proxy.setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.getOwnPropertyNames(o), ['x', 'y', 'z']);
        });

        it('should support Object.assign()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            Proxy.setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.assign({}, o), { x: 1, y: 2, z: 3 });
        });

        it('should support construction', function () {
            let count = 0;
            let ctorArgs;
            function Ctor () {}
            const ProxyCtor = new Proxy(Ctor, {
                construct: function (target, args) {
                    count += 1;
                    ctorArgs = args;
                    return {};
                }
            });
            new ProxyCtor([1, 2, 3]);
            assert(count === 1);
            assert.deepEqual(ctorArgs, [[1, 2, 3]]);
        });

        it('should support apply', function () {
            let count = 0;
            let callArgs;
            let callThis;
            let rv = {};
            let thisArg = {};
            function handler () {}
            const proxyHandler = new Proxy(handler, {
                apply: function (target, thisArg, args) {
                    count += 1;
                    callArgs = args;
                    callThis = thisArg;
                    return rv;
                }
            });
            const functionReturn = proxyHandler.call(thisArg, [1, 2, 3]);
            assert(count === 1);
            assert(callThis, thisArg);
            assert.deepEqual(callArgs, [[1, 2, 3]]);
            assert(functionReturn, rv);
        });

        it('should not throw if get trap returns false', function () {
            const proxy = new Proxy({}, {
                get: function () {
                    return false;
                }
            });
            expect(() => {
                Proxy.getKey(proxy, 'foo');
            }).not.toThrow();
        });

        it('should throw if set trap returns false', function () {
            const proxy = new Proxy({}, {
                set: function () {
                    return false;
                }
            });
            expect(() => {
                Proxy.setKey(proxy, 'foo');
            }).toThrow("'set' on proxy: trap returned falsish for property 'foo'");
        });

        it('should support delete', function () {
            let count = 0;
            let callKey;
            let callTarget;
            const proxyTarget = {};
            const proxy = new Proxy(proxyTarget, {
                deleteProperty: function (target, key) {
                    count += 1;
                    callKey = key;
                    callTarget = target;
                    return true;
                }
            });
            Proxy.deleteKey(proxy, 'foo');
            expect(callKey).toBe('foo');
            expect(callTarget).toBe(proxyTarget);
            expect(count).toBe(1);
        });

        it('should throw if delete trap returns false', function () {
            const proxy = new Proxy({}, {
                deleteProperty: function () {
                    return false;
                }
            });
            expect(() => {
                Proxy.deleteKey(proxy, 'foo');
            }).toThrow("'deleteProperty' on proxy: trap returned falsish for property 'foo'");
        });

        it('should throw if defineProperty trap returns false', function () {
            const proxy = new Proxy({}, {
                defineProperty: function () {
                    return false;
                }
            });
            expect(() => {
                Object.defineProperty(proxy, 'foo', {});
            }).toThrow("'defineProperty' on proxy: trap returned falsish for property 'foo'");
        });

        it('should support getOwnPropertyDescriptor with XProxy objects', () => {
            let count = 0;
            const obj = { x: 1, y : 2 };
            const o = new Proxy(obj, {
                getOwnPropertyDescriptor: function (target, key) {
                    count += 1;
                    return Object.getOwnPropertyDescriptor(target, key);
                }
            });
            const descriptor = {
                value: 1,
                enumerable: true,
                configurable: true,
                writable: true
            };
            assert.deepEqual(Object.getOwnPropertyDescriptor(o, 'x'), descriptor);
            assert(count === 1);
        });

        it('should support preventExtensions with XProxy objects', () => {
            let count = 0;
            const o = new Proxy({ x: 1, y : 2 }, {
                preventExtensions: function (target) {
                    count += 1;
                    Object.preventExtensions(target);
                    return true;
                }
            });
            Object.preventExtensions(o);
            assert(count === 1);
            assert(Object.isExtensible(o) === false);
        });

        it('should throw if preventExtensions trap returns false', function () {
            const proxy = new Proxy({}, {
                preventExtensions: function () {
                    return false;
                }
            });
            expect(() => {
                Object.preventExtensions(proxy);
            }).toThrow("'preventExtensions' on proxy: trap returned falsish");
        });

        it('should support preventExtensions with vanilla objects', () => {
            const vanilla = {};
            Object.preventExtensions(vanilla);
            assert(Object.isExtensible(vanilla) === false);
        });

        it('should support getPrototypeOf', function () {
            let count = 0;
            const proto = {};
            const obj = Object.create(proto);
            const proxy = new Proxy(obj, {
                getPrototypeOf: function (target) {
                    count += 1;
                    return Object.getPrototypeOf(target);
                }
            });
            assert(Object.getPrototypeOf(proxy) === proto);
            assert(count === 1);
        });

        it('should support setPrototypeOf', function () {
            let count = 0;
            const proto = {};
            const obj = {};
            const proxy = new Proxy(obj, {
                setPrototypeOf: function (target, proto) {
                    count += 1;
                    Object.setPrototypeOf(target, proto);
                    return true;
                }
            });
            Object.setPrototypeOf(proxy, proto);
            assert(Object.getPrototypeOf(proxy) === proto);
            assert(Object.getPrototypeOf(obj) === proto);
            assert(count === 1);
        });

        it('should throw if setPrototypeOf trap returns false', function () {
            const proxy = new Proxy({}, {
                setPrototypeOf: function () {
                    return false;
                }
            });
            expect(() => {
                Object.setPrototypeOf(proxy, {});
            }).toThrow("'setPrototypeOf' on proxy: trap returned falsish");
        });

        it('should support Object.prototype.hasOwnProperty()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            assert.strictEqual(o.hasOwnProperty('x'), true);
            Proxy.setKey(o, 'z', 3); // expando
            assert.strictEqual(o.hasOwnProperty('z'), true);
            assert.strictEqual(Object.prototype.hasOwnProperty.call(o, 'z'), true);
        });

    });

});
