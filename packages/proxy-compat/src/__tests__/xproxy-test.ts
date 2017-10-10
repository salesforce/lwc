import Proxy from "../main";
import assert from 'power-assert';

describe('Proxy', () => {

    describe('constructor', () => {

        it('should throw when target is not object', () => {
            assert.throws(() => {
                new Proxy();
            });
            assert.throws(() => {
                new Proxy(null, {});
            });
            assert.throws(() => {
                new Proxy(undefined, {});
            });
            assert.throws(() => {
                new Proxy(0, {});
            });
            assert.throws(() => {
                new Proxy(1, {});
            });
        });

        it('should throw when handler is not an object', () => {
            assert.throws(() => {
                new Proxy({});
            });
            assert.throws(() => {
                new Proxy({}, null);
            });
            assert.throws(() => {
                new Proxy({}, 0);
            });
            assert.throws(() => {
                new Proxy({}, 1);
            });
        });

    });

    describe('revokable', function () {
        it('should throw error when getting key', function () {
            const obj = {};
            const { proxy, revoke } = Proxy.revocable(obj, {
                get: function () {

                }
            });

            revoke();
            expect(() => {
                Proxy.getKey(proxy, 'foo');
            }).toThrow("Cannot perform 'get' on a proxy that has been revoked");
        });

        it('should throw error after instantiation', function () {
            function fn() {
                this.x = 1;
            }
            const { proxy, revoke } = Proxy.revocable(fn, {});
            revoke();
            expect(() => {
                proxy('this will blow up');
            }).toThrow("Cannot perform 'apply' on a proxy that has been revoked");
        });
    });

    describe('apply trap', () => {
        it('should apply with the correct context and arguments', function () {
            let c;
            function fn(...args) {
                c = this;
                return args;
            }
            const proxy = new Proxy(fn, {});
            const o = {};
            const result = proxy.call(o, 'a', 'b');
            expect(c === o);
            expect(result[0] === 'a');
            expect(result[1] === 'b');
        });
    });

    describe('Array indexes', function () {
        it('should allow arbitrary index access without getKey', function () {
            const array = ['a', 'b'];
            const proxy = new Proxy(array, {});
            expect(proxy[1]).toBe('b');
        });

        it('should allow arbitrary index access when length becomes smaller', function () {
            const array = ['a', 'b'];
            const proxy = new Proxy(array, {});
            proxy.splice(0, 1);
            expect(proxy[0]).toBe('b');
            expect(proxy[1]).toBe(undefined);
        });

        it('should allow arbitrary index access when length grows', function () {
            const array = ['a', 'b'];
            const proxy = new Proxy(array, {});
            proxy.push('c');
            expect(proxy[0]).toBe('a');
            expect(proxy[1]).toBe('b');
            expect(proxy[2]).toBe('c');
        });

        it('should clear array when length is set directly', function () {
            const array = ['a', 'b'];
            const proxy = new Proxy(array, {});
            proxy.length = 0;
            expect(array).toEqual([]);
        });

        it('should clear array when length is set with getKey', function () {
            const array = ['a', 'b'];
            const proxy = new Proxy(array, {});
            Proxy.setKey(proxy, 'length', 0);
            expect(array).toEqual([]);
        });

        it('should correctly loop through proxy array using native functions', function () {
            const array = ['a', 'b'];
            const proxy = new Proxy(array, {});
            const values = [];
            proxy.forEach((value) => {
                values.push(value);
            });
            expect(values).toEqual([
                'a',
                'b'
            ]);
        });

        it('should respect array length when trap returns larger value than target', function () {
            const array = ['a', 'b', 'c'];
            const proxy = new Proxy(array, {
                get: function (target, key) {
                    if (key === 'length') {
                        return 4;
                    }

                    if(key === 3) {
                        return 'd';
                    }
                    return target[key];
                }
            });
            const values = [];
            proxy.forEach((value) => {
                values.push(value);
            });
            expect(values).toEqual([
                'a',
                'b',
                'c',
                'd'
            ]);
        });

        it('should respect array length when trap returns smaller value than target', function () {
            const array = ['a', 'b', 'c'];
            const proxy = new Proxy(array, {
                get: function (target, key) {
                    if (key === 'length') {
                        return 2;
                    }
                    return target[key];
                }
            });
            const values = [];
            proxy.forEach((value) => {
                values.push(value);
            });
            expect(values).toEqual([
                'a',
                'b'
            ]);
            expect(proxy[2]).toBe(undefined);
            expect(2 in proxy).toBe(false);
        });
    });

});
