import * as target from '../api';
import assert from 'power-assert';
import { Element } from "../html-element";

describe('api', () => {

    describe('#c()', () => {
        it('should convert className to a classMap property', () => {
            class Foo extends Element {}
            const vnode = target.c('x-foo', Foo, { className: 'foo' });
            assert.deepEqual(vnode.data.class, { foo: true });
        });

        it('should split classNames on white spaces', () => {
            class Foo extends Element {}
            const vnode = target.c('x-foo', Foo, { className: 'foo bar   baz' });
            assert.deepEqual(vnode.data.class, { foo: true, bar: true, baz: true });
        });

        it('should throw if the vnode contains both a computed className and a classMap', () => {
            class Foo extends Element {}
            assert.throws(() => {
                target.c('x-foo', Foo, {
                    className: 'foo',
                    classMap: { foo: true }
                });
            }, /className/);
        });

        it('should call the Ctor factory for circular dependencies', () => {
            class Foo extends Element {}
            const factory = function () { return Foo };
            factory.__circular__ = true;
            const vnode = target.c('x-foo', factory, { className: 'foo' });
            assert.strictEqual(Foo, vnode.Ctor);
        });

        it('assign correct style value when styleMap is present', () => {
            const styleMap = {
                color: 'red'
            };
            class Foo extends Element {}
            const factory = function () { return Foo };
            const vnode = target.c('x-foo', Foo, { styleMap });

            assert.deepEqual(vnode.data.style, {
                color: 'red'
            });
        });

        it('assign correct style value when style is present', () => {
            const style = 'color:red';
            class Foo extends Element {}
            const factory = function () { return Foo };
            const vnode = target.c('x-foo', factory, { style });

            assert.deepEqual(vnode.data.style, 'color:red');
        });

        it('should coerce style to string when is object', () => {
            const style = {
                color: 'red'
            };
            class Foo extends Element {}
            const factory = function () { return Foo };
            const vnode = target.c('x-foo', factory, { style });

            assert.deepEqual(vnode.data.style, '[object Object]');
        });
    });

    describe('#h()', () => {
        it('should convert className to a classMap property', () => {
            const vnode = target.h('p', { className: 'foo' }, []);
            assert.deepEqual(vnode.data.class, { foo: true });
        });

        it('should allow null entries in children', () => {
            const vnode = target.h('p', {}, [null]);
            assert.deepEqual([null], vnode.children);
        });

        it('should split classNames on white spaces', () => {
            const vnode = target.h('p', { className: 'foo bar   baz' }, []);
            assert.deepEqual(vnode.data.class, { foo: true, bar: true, baz: true });
        });

        it('should throw if the vnode contains both a computed className and a classMap', () => {
            assert.throws(() => {
                target.h('p', {
                    className: 'foo',
                    classMap: { foo: true }
                }, []);
            }, /className/);
        });

        it('should throw for anything other than vnode and null', () => {
            assert.throws(() => {
                target.h('p', {}, ['text']);
            });
            assert.throws(() => {
                target.h('p', {}, [undefined]);
            });
        });

        it('assign correct style value when styleMap is present', () => {
            const styleMap = {
                color: 'red'
            };
            const vnode = target.h('p', { styleMap }, []);

            assert.deepEqual(vnode.data.style, {
                color: 'red'
            });
        });

        it('assign correct style value when style is present', () => {
            const style = 'color:red';
            const vnode = target.h('p', { style }, []);

            assert.deepEqual(vnode.data.style, 'color:red');
        });

        it('should coerce style to string when is object', () => {
            const style = {
                color: 'red'
            };
            const vnode = target.h('p', { style }, []);

            assert.deepEqual(vnode.data.style, '[object Object]');
        });
    });

    describe('#n()', () => {
        // TBD
    });

    describe('#i()', () => {
        it('should support various types', () => {
            assert.deepEqual(target.i([], () => null), [], 'empty array');
            assert.deepEqual(target.i(undefined, () => null), [], 'undefined');
            assert.deepEqual(target.i(null, () => null), [], 'null');
        });
        it('should support numeric keys', () => {
            assert.deepEqual(target.i([{key: 0}], () => null), [null], 'numeric key');
            assert.deepEqual(target.i([{key: 1}], () => null), [null], 'another numeric key');
        });
        it('should provide item and index', () => {
            const o = {x: 1};
            assert.deepEqual(target.i([o], (item, index) => {
                return { index, item };
            }), [{ index: 0, item: o }]);
        });

        it('should provide correct last value', () => {
            const o = [
                {x: 1},
                {x: 2},
                {x: 3}
            ];

            const expected = [
                false,
                false,
                true
            ];
            assert.deepEqual(target.i(o, (item, index, first, last) => {
                return last;
            }), expected);
        });

        it('should handle arrays', function () {
            const o = [1, 2];
            const expected = ['1a', '2a'];
            const iterated = target.i(o, (item, index, first, last) => {
                return item + 'a';
            });
            expect(expected).toEqual(iterated);
        });

        it('should handle Sets', function () {
            const o = new Set();
            o.add(1);
            o.add(2);
            const expected = ['1a', '2a'];
            expect(expected).toEqual(target.i(o, (item, index, first, last) => {
                return item + 'a';
            }));
        });

        it('should handle Map', function () {
            const o = new Map();
            o.set('foo', 1);
            o.set('bar', 2);
            const expected = ['foo,1a', 'bar,2a'];
            expect(expected).toEqual(target.i(o, (item, index, first, last) => {
                return item + 'a';
            }));
        });

        it('should handle proxies objects', function () {
            const array = [1, 2];
            const o = new Proxy(array, {});
            const expected = ['1a', '2a'];
            const iterated = target.i(o, (item, index, first, last) => {
                return item + 'a';
            });
            expect(expected).toEqual(iterated);
        });

        it('should return empty array when undefined is passed', function () {
            expect(target.i(undefined, (item, index, first, last) => {
                return item + 'a';
            })).toEqual([]);
        });

        it('should return empty array when null is passed', function () {
            expect(target.i(null, (item, index, first, last) => {
                return item + 'a';
            })).toEqual([]);
        });
    });

    describe('#f()', () => {
        // TBD
    });

});
