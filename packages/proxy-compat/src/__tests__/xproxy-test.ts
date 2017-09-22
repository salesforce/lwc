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

    it('apply trap', () => {
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

});
