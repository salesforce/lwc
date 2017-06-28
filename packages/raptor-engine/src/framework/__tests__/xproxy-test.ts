import { callKey } from '../xproxy';
import assert from 'power-assert';

describe('xproxy', () => {

    describe('callKey', () => {

        it.compat('should preserve the context', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            callKey(o.foo, 'bar', 1, 2);
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
        });

        it.compat('should support .call', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            callKey(o.foo.bar, 'call', o.foo, 1, 2);
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
        });

        it.compat('should support .apply', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            callKey(o.foo.bar, 'apply', o.foo, [1, 2]);
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
        });

        it.compat('should support no arguments', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            callKey(o.foo, 'bar');
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 0);
        });

    });

});
