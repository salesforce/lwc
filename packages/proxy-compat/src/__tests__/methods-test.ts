import Proxy from "../main";
import assert from 'power-assert';

describe('Proxy', () => {

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
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
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
            assert.strictEqual(context, Proxy.getKey(o, 'foo'));
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
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
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
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
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
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
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 0);
        });

    });

});
