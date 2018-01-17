import { Root, wrapIframeWindow } from "../root";
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';

describe('root', () => {
    describe('#constructor()', () => {

        it('should throw for invalid vm reference', () => {
            expect(() => new Root()).toThrow();
        });

    });

    describe('integration', () => {

        it('should support this.root.host', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            expect(vnode.vm.component).toBe(vnode.vm.component.root.host);
        });

        it('should support this.root.mode', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            expect(vnode.vm.component.root.mode).toBe('closed');
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
                expect(nodes).toHaveLength(1);
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
                expect(node.tagName).toBe('P');
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
                expect(nodes).toHaveLength(0);
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
                expect(node).toBeNull();
            });
        });

    });

    describe.only('wrapped iframe window', () => {
        let iframe;
        beforeEach(() => {
            console.log('before')
            iframe = document.createElement('iframe');
            iframe.src = 'http://daringfireball.net';
            return new Promise((res) => {
                setTimeout(res, 1000);
            })
        });

        it('should doo', function () {
            iframe.contentWindow.foo;
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
                expect(ul);
                const li = ul.querySelector('li');
                expect(li);
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
                expect(ul);
                const li = ul.querySelectorAll('li')[0];
                expect(li);
            });
        });

        it('should ignore extraneous elements', () => {
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
                expect(ul);
                ul.appendChild(document.createElement('li'));
                const li1 = ul.querySelectorAll('li')[0];
                expect(li1).toBeUndefined();
                const li2 = ul.querySelector('li');
                expect(li2).toBeNull();
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

        it('should return null if querySelector does not match any elements', () => {
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
                expect(vnode.vm.component.root.querySelector('doesnotexist')).toBeNull();
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

        it('should allow walking back to the shadow root', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('div', {}, [])]
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);

            return Promise.resolve().then(() => {
                const root = vnode.vm.component.root;
                expect(root.querySelector('div').parentNode).toBe(root);
            });
        });

    });

});
