import { callKey, setKey, getKey } from '../xproxy';
import assert from 'power-assert';
import { getReactiveProxy } from '../reactive';

describe('xproxy', () => {

    describe('callKey', () => {

        it.compat('should preserve the context on regular objects', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            };
            callKey(o.foo, 'bar', 1, 2);
            assert.strictEqual(context, o.foo);
            assert.strictEqual(args.length, 2);
            assert.strictEqual(args[0], 1);
            assert.strictEqual(args[1], 2);
        });

        it.compat('should preserve context on membranes', () => {
            let context, args;
            const o = getReactiveProxy({
                foo: getReactiveProxy({
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                })
            });
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

    describe('intrinsics', () => {

        it.compat('should support Arrays', () => {
            let context, args;
            const o = getReactiveProxy([1, 2]);
            assert.strictEqual(Array.isArray(o), true);
            assert.strictEqual(o.length, 2);
            assert.strictEqual(o[0], 1);
            assert.strictEqual(o[1], 2);
            setKey(o, '2', 3);
            assert.strictEqual(o.length, 3);
            assert.strictEqual(getKey(o, 2), 3, 'expandos are not supported'); // expando
        });

        it.compat('should support Object.keys()', () => {
            let context, args;
            const o = getReactiveProxy({ x: 1, y: 2 });
            setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.keys(o), ['x', 'y', 'z']);
        });

        it.compat('should support Object.getOwnPropertyNames()', () => {
            let context, args;
            const o = getReactiveProxy({ x: 1, y: 2 });
            setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.getOwnPropertyNames(o), ['x', 'y', 'z']);
        });

        it.compat('should support Object.assign()', () => {
            let context, args;
            const o = getReactiveProxy({ x: 1, y: 2 });
            setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.assign({}, o), { x: 1, y: 2, z: 3 });
        });

        it.compat('should support Object.prototype.hasOwnProperty()', () => {
            let context, args;
            const o = getReactiveProxy({ x: 1, y: 2 });
            assert.strictEqual(o.hasOwnProperty('x'), true);
            setKey(o, 'z', 3); // expando
            assert.strictEqual(o.hasOwnProperty('z'), true);
            assert.strictEqual(Object.prototype.hasOwnProperty.call(o, 'z'), true);
        });

    });

});
