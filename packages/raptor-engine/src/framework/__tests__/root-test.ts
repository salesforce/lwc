import { Root } from "../root";
import assert from 'power-assert';
import { Element } from "../html-element";
import { OwnerKey } from "../vm";
import * as api from "../api";
import { patch } from '../patch';

describe('root', () => {
    describe('#constructor()', () => {

        it('should throw for invalid vm reference', () => {
            assert.throws(() => new Root(), 'prevent creation of such objects in user-land');
        });

    });

    describe('integration', () => {

        it('should support this.root.host', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            assert.equal(vnode.vm.component, vnode.vm.component.root.host);
        });

        it('should support this.root.mode', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            assert.strictEqual('closed', vnode.vm.component.root.mode);
        });

        it('should allow searching for elements from template', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('p', {}, [])]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const nodes = vnode.vm.component.root.querySelectorAll('p');
                assert.strictEqual(1, nodes.length);
                assert.strictEqual(vnode.vm.uid, nodes[0][OwnerKey], 'uid was not propagated');
            });
        });

        it('should allow searching for one element from template', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('p', {}, [])]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const node = vnode.vm.component.root.querySelector('p');
                assert.strictEqual('P', node.tagName);
                assert.strictEqual(vnode.vm.uid, node[OwnerKey], 'uid was not propagated');
            });
        });

        it('should ignore elements from other owner', () => {
            const outerp = api.h('p', {}, []);
            const def = class MyComponent extends Element {
                render() {
                    return () => [outerp]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const nodes = vnode.vm.component.root.querySelectorAll('p');
                assert.strictEqual(0, nodes.length);
            });
        });

        it('should ignore element from other owner', () => {
            const outerp = api.h('p', {}, []);
            const def = class MyComponent extends Element {
                render() {
                    return () => [outerp]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const node = vnode.vm.component.root.querySelector('p');
                assert.strictEqual(undefined, node);
            });
        });

    });

});
