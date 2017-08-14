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

    describe('reify', function () {
        it('should define property correctly', function () {
            const originalTarget = {};
            const symbol = Symbol();
            const proxy = new Proxy({}, {});
            Proxy.reify(proxy, {
                [symbol]: {
                    value: originalTarget
                },
                foo: {
                    value: 'bar'
                }
            });
            assert(proxy[symbol] === originalTarget);
            assert(proxy.foo === 'bar');
        });

        it('should fail when first argument is not valid XProxy', function () {
            const originalTarget = {};
            const symbol = Symbol();
            expect(() => {
                Proxy.reify({}, {
                    [symbol]: {
                        value: originalTarget
                    },
                    foo: {
                        value: 'bar'
                    }
                });
            }).toThrow('Cannot reify [object Object]. [object Object] is not a valid compat Proxy instance.');
        });

        it('should not fail when second argument is undefined', function () {
            const proxy = new Proxy({}, {});
            expect(() => {
                Proxy.reify(proxy);
            }).toThrow();
        })
    });

});
