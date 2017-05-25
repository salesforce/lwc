import { ClassList } from "../class-list";
import assert from 'power-assert';
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';

describe('class-list', () => {
    describe('#constructor()', () => {

        it('should throw for invalid vm reference', () => {
            assert.throws(() => new ClassList(), 'prevent creation of such objects in user-land');
        });

    });

    describe('integration', () => {

        it('should support outer className', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should support outer classMap', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            vnode = api.c('x-foo', def, { classMap: { foo: 1 } });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should combine inner classes first and then data.className', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'bar  baz' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo bar baz');
        });

        it('should not allow deleting outer classes from within', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.remove('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should dedupe all classes', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo   foo' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should combine outer classMap and inner classes', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { classMap: { bar: 1 } });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo bar');
        });

        it('should support toggle', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    this.classList.toggle('foo');
                    this.classList.toggle('bar');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.equal(elm.className, 'bar');
        });

        it('should support toggle with force', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.toggle('foo', true);
                    this.classList.toggle('bar', false);
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should support contains', () => {
            let vnode, a, b;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    a = this.classList.contains('foo');
                    b = this.classList.contains('bar');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.strictEqual(true, a);
            assert.strictEqual(false, b);
        });

        it('should support item', () => {
            let vnode, a, b;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    a = this.classList.item(0);
                    b = this.classList.item(1);
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.strictEqual('foo', a);
            assert.strictEqual(null, b);
        });

        it('should update on the next tick when dirty', () => {
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.state.x = 1;
                    this.classList.add('foo');
                }
                addAnotherClass() {
                    this.classList.add('bar');
                }
                addOtherClass() {
                    this.classList.add('baz');
                }
                render() {
                    this.state.x;
                }
            }
            MyComponent.publicProps = { x: true };
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { props: { x: 1 } });
            patch(elm, vnode);
            assert.strictEqual('foo', elm.className);
            vnode.vm.component.addAnotherClass(); // add when not dirty
            vnode.vm.component.state.x = 2; // dirty trigger
            vnode.vm.component.addOtherClass(); // adding after dirty
            assert.strictEqual(true, vnode.vm.isDirty, 'should be dirty');
            return Promise.resolve().then(() => {
                assert.strictEqual('foo bar baz', elm.className);
            });
        });

    });

});
