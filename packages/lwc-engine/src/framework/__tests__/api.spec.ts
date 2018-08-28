import * as api from '../api';
import { createElement, LightningElement } from '../main';
import { getHostShadowRoot } from '../html-element';

describe('api', () => {
    describe('#c()', () => {
        class Foo extends LightningElement {}

        it('should call the Ctor factory for circular dependencies', () => {
            const factory = function() { return class extends LightningElement {
                static forceTagName = 'input';
            }; };
            factory.__circular__ = true;
            const vnode = api.c('x-foo', factory, { className: 'foo' });
            expect(vnode.tag).toBe('input');
        });

        it('should convert className to a classMap property', () => {
            const vnode = api.c('x-foo', Foo, { className: 'foo' });
            expect(vnode.data.class).toEqual({ foo: true });
        });

        it('should split classNames on white spaces', () => {
            const vnode = api.c('x-foo', Foo, { className: 'foo bar   baz' });
            expect(vnode.data.class).toEqual({ foo: true, bar: true, baz: true });
        });

        it('should throw if the vnode contains both a computed className and a classMap', () => {
            expect(() => {
                api.c('x-foo', Foo, {
                    className: 'foo',
                    classMap: { foo: true }
                });
            }).toThrowError(/className/);
        });

        it('assign correct style value when styleMap is present', () => {
            const styleMap = { color: 'red' };
            const factory = function() {
                return Foo;
            };
            const vnode = api.c('x-foo', Foo, { styleMap });

            expect(vnode.data.style).toEqual({ color: 'red' });
        });

        it('assign correct style value when style is present', () => {
            const style = 'color:red';
            const factory = function() { return Foo; };
            const vnode = api.c('x-foo', factory, { style });

            expect(vnode.data.style).toBe('color:red');
        });

        it('should coerce style to string when is object', () => {
            const style = {
                color: 'red'
            };
            const factory = function() { return Foo; };
            let vnode;

            // just to have a vm being rendered.
            class VmRendering extends LightningElement {
                render() {
                    vnode = api.c('x-foo', factory, { style });
                    return () => [];
                }
            }

            const elm = createElement('x-vm-aux', { is: VmRendering });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`Invalid 'style' attribute passed to <x-foo> should be a string value, and will be ignored.`);

            expect(vnode.data.style).toBe('[object Object]');
        });

        it('should throw an error when createElement is called without Ctor', function() {
            expect(() => {
                createElement('x-foo');
            }).toThrow();
        });

        it('should support forceTagName static definition to force tagname on root node', () => {
            class Bar extends LightningElement {
                static forceTagName = 'input';
            }
            const element = createElement('x-foo', { is: Bar });
            document.body.appendChild(element);
            expect(element.tagName).toBe('INPUT');
            // the "is" attribute is only inserted after the element is connected
            expect(element.getAttribute('is')).toBe('x-foo');
        });

        it('should not include is attribute when forceTagName is not present on root', () => {
            class Bar extends LightningElement {}
            const element = createElement('x-foo', { is: Bar });
            expect(element.hasAttribute('is')).toBe(false);
        });

        it('should ignore forceTagName static definition if "is" attribute is defined in template', () => {
            function html($api) {
                return [$api.c('button', Bar, { attrs: { is: "x-bar" } })];
            }
            class Foo extends LightningElement {
                render() {
                    return html;
                }
            }
            class Bar extends LightningElement {
                static forceTagName = 'input';
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);

            const span = getHostShadowRoot(elm).querySelector('button');
            expect(span.tagName).toEqual('BUTTON');
            expect(span.getAttribute('is')).toEqual('x-bar');
        });

        it('should throw if the forceTagName value is a reserved standard element name', () => {
            class Bar extends LightningElement {
                static forceTagName = 'div';
            }

            expect(() => {
                createElement('x-foo', { is: Bar });
            }).toThrow(
                /Invalid static forceTagName property set to "div"/
            );
        });

        it('should throw if the forceTagName is a custom element name', () => {
            class Bar extends LightningElement {
                static forceTagName = 'x-bar';
            }

            expect(() => {
                createElement('x-foo', { is: Bar });
            }).toThrow(
                /Invalid static forceTagName property set to "x-bar"/
            );
        });

        it('should log warning if passed style is not a string', () => {
            const style = {
                color: 'red'
            };
            const factory = function() { return Foo; };
            // just to have a vm being rendered.
            class VmRendering extends LightningElement {
                render() {
                    api.c('x-foo', factory, { style });
                    return () => [];
                }
            }

            const elm = createElement('x-vm-aux', { is: VmRendering });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`Invalid 'style' attribute passed to <x-foo> should be a string value, and will be ignored.`);
        });

    });

    describe('#h()', () => {
        it('should convert className to a classMap property', () => {
            const vnode = api.h('p', { key: 0, className: 'foo' }, []);
            expect(vnode.data.class).toEqual({ foo: true });
        });

        it('should allow null entries in children', () => {
            const vnode = api.h('p', { key: 0 }, [null]);
            expect(vnode.children).toEqual([null]);
        });

        it('should split classNames on white spaces', () => {
            const vnode = api.h('p', { key: 0, className: 'foo bar   baz' }, []);
            expect(vnode.data.class).toEqual({ foo: true, bar: true, baz: true });
        });

        it('should throw if the vnode contains both a computed className and a classMap', () => {
            expect(() => {
                api.h('p', {
                    key: 0,
                    className: 'foo',
                    classMap: { foo: true }
                }, []);
            }).toThrowError(/className/);
        });

        it('should throw for anything other than vnode and null', () => {
            expect(() => {
                api.h('p', { key: 0 }, ['text']);
            });

            expect(() => {
                api.h('p', {}, [undefined]);
            });
        });

        it('assign correct style value when styleMap is present', () => {
            const styleMap = {
                color: 'red'
            };
            const vnode = api.h('p', { key: 0, styleMap }, []);

            expect(vnode.data.style).toEqual({
                color: 'red'
            });
        });

        it('assign correct style value when style is present', () => {
            const style = 'color:red';
            const vnode = api.h('p', { key: 0, style }, []);

            expect(vnode.data.style).toBe('color:red');
        });

        it('should coerce style to string when is object', () => {
            const style = {
                color: 'red'
            };
            let vnode;
            class VmRendering extends LightningElement {
                render() {
                    vnode = api.h('p', { key: 0, style }, []);
                    return () => [];
                }
            }

            const elm = createElement('x-vm-aux', { is: VmRendering });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`Invalid 'style' attribute passed to <p> should be a string value, and will be ignored.`);

            expect(vnode.data.style).toBe('[object Object]');
        });

        it('should logWarning when passing style attribute as object', () => {
            const style = {
                color: 'red'
            };

            class VmRendering extends LightningElement {
                render() {
                    api.h('p', { key: 0, style }, []);
                    return () => [];
                }
            }

            const elm = createElement('x-vm-aux', { is: VmRendering });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`Invalid 'style' attribute passed to <p> should be a string value, and will be ignored.`);
        });
    });

    describe('#i()', () => {
        it('should support various types', () => {
            class VmRendering extends LightningElement {
                render() {
                    expect(api.i([], () => null)).toEqual([]);
                    expect(api.i(undefined as any, () => null)).toEqual([]);
                    expect(api.i(null as any, () => null)).toEqual([]);
                    return () => [];
                }
            }
            const elm = createElement('x-vm-aux', { is: VmRendering });
            document.body.appendChild(elm);
        });

        it('should support numeric keys', () => {
            expect(api.i([{key: 0}], () => null)).toEqual([null]);
            expect(api.i([{key: 1}], () => null)).toEqual([null]);
        });

        it('should provide item and index', () => {
            const o = {x: 1};
            const vnodes = api.i([o], (item, index) => ({ index, item }));
            expect(vnodes).toEqual([{ index: 0, item: o }]);
        });

        it('should provide correct last value', () => {
            const o = [
                {x: 1},
                {x: 2},
                {x: 3}
            ];
            const vnodes = api.i(o, (item, index, first, last) => last);
            expect(vnodes).toEqual([false, false, true]);
        });

        it('should handle arrays', function() {
            const o = [1, 2];
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['1a', '2a']);
        });

        it('should handle Sets', function() {
            const o = new Set();
            o.add(1);
            o.add(2);
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['1a', '2a']);
        });

        it('should handle Map', function() {
            const o = new Map();
            o.set('foo', 1);
            o.set('bar', 2);
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['foo,1a', 'bar,2a']);
        });

        it('should handle proxies objects', function() {
            const array = [1, 2];
            const o = new Proxy(array, {});
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['1a', '2a']);
        });

        it('should log warning when invalid iteration value', () => {
            class VmRendering extends LightningElement {
                render() {
                    api.i(undefined as any, () => null);
                    return () => [];
                }
            }
            const elm = createElement('x-vm-aux', { is: VmRendering });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`Invalid template iteration for value "undefined" in [object:vm VmRendering (9)], it should be an Array or an iterable Object.`);
        });
    });

    describe('#f()', () => {
        // TBD
    });

    describe('#t()', () => {
        it('should produce a text node', () => {
            function html($api) {
                return [$api.t('miami')];
            }
            class Foo extends LightningElement {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            // TODO: once we switch to shadow DOM this test will have to be adjusted
            expect(elm.textContent).toEqual('miami');
        });
    });

    describe('#p()', () => {
        it('should produce a comment', () => {
            function html($api) {
                return [$api.p('miami')];
            }
            class Foo extends LightningElement {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            // TODO: once we switch to shadow DOM this test will have to be adjusted
            expect(elm.innerHTML).toEqual('<!--miami-->');
        });
    });

    describe('#d()', () => {
        // TBD
    });

    describe('#b()', () => {
        // TBD
    });

    describe('#k()', () => {
        it('should combine keys', () => {
            let k1, k2;
            function html($api) {
                k1 = $api.k(123, 345);
                k2 = $api.k(345, "678");
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(k1).toEqual('123:345');
            expect(k2).toEqual('345:678');
        });
        it('should throw when key is an object', () => {
            function html($api) {
                const k1 = $api.k(678, {});
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow('Invalid key value "[object Object]" in [object:vm Foo (13)]. Key must be a string or number.');
        });
    });
});
