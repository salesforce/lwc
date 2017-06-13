import { Root } from "../root";
import assert from 'power-assert';
import { Element } from "../html-element";
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
            });
        });

        it.skip('should ignore elements from other owner', () => {
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

        it.skip('should ignore element from other owner', () => {
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


    describe('membrane', () => {

        it('should querySelector on element from template', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('ul', {}, [api.h('li', {}, [])])]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const ul = vnode.vm.component.root.querySelector('ul');
                assert(ul);
                const li = ul.querySelector('li');
                assert(li);
            });
        });

        it('should querySelectorAll on element from template', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('ul', {}, [api.h('li', {}, [])])]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const ul = vnode.vm.component.root.querySelectorAll('ul')[0];
                assert(ul);
                const li = ul.querySelectorAll('li')[0];
                assert(li);
            });
        });

        it.skip('should ignore extraneous elements', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('ul', {}, [])]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const ul = vnode.vm.component.root.querySelector('ul');
                assert(ul);
                ul.appendChild(document.createElement('li'));

                /*
                 * The assertions below will fail because of changes made for
                 * https://git.soma.salesforce.com/raptor/raptor/issues/369
                 * tldr; getComputedStyle (and other primitives) throw an error if first argument is
                 * anything but a HTML Element. root.querySelector is designed to
                 * return an element wrapped in proxe that limits access
                 * to children nodes based on who owns those elements. Returning
                 * An element breaks this behavior
                */

                const li1 = ul.querySelectorAll('li')[0];
                assert(li1 === undefined, `querySelectorAll is not ignoring extraneous`);
                const li2 = ul.querySelector('li');
                assert(li2 === undefined, `querySelector is not ignoring extraneous`);
            });
        });

        it('should not throw error if querySelector does not match any elements', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('ul', {}, [])]
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            
            return Promise.resolve().then(() => {
                expect(() => {
                    vnode.vm.component.root.querySelector('doesnotexist');
                }).not.toThrow();
            });
        });

        it('should return undefined if querySelector does not match any elements', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('ul', {}, [])]
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            
            return Promise.resolve().then(() => {
                assert(vnode.vm.component.root.querySelector('doesnotexist') === null);
            });
        });

        it('should not throw error if querySelectorAll does not match any elements', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('ul', {}, [])]
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            
            return Promise.resolve().then(() => {
                expect(() => {
                    vnode.vm.component.root.querySelectorAll('doesnotexist');
                }).not.toThrow();
            });
        });

    });

});
