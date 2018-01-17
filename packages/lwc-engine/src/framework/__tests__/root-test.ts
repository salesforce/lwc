import { Root, wrapIframeWindow } from "../root";
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';
import { unwrap } from '../membrane';
import { createElement } from '../main';

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

    describe('wrapped iframe window', () => {
        describe('methods', function () {
            let contentWindow;
            let wrapped;
            let setLocation;
            beforeEach(() => {
                setLocation = jest.fn();
                contentWindow = {
                    postMessage: jest.fn(),
                    blur: jest.fn(),
                    close: jest.fn(),
                    focus: jest.fn(),
                    get closed() {
                        return 'mock closed';
                    },
                    get frames() {
                        return 'mock frames';
                    },
                    get length() {
                        return 'mock length';
                    },
                    get location() {
                        return 'mock location';
                    },
                    set location(value) {
                        setLocation(value);
                    },
                    get opener() {
                        return 'mock opener';
                    },
                    get parent() {
                        return 'mock parent';
                    },
                    get self() {
                        return 'mock self';
                    },
                    get top() {
                        return 'mock top';
                    },
                    get window() {
                        return 'mock window';
                    },
                };

                wrapped = wrapIframeWindow(contentWindow);
            });

            it('should delegate setting location', function () {
                wrapped.location = 'foo';
                expect(setLocation).toHaveBeenCalledWith('foo');
            });

            it('should delegate window', function () {
                expect(contentWindow.window).toBe('mock window');
            });

            it('should delegate top', function () {
                expect(contentWindow.top).toBe('mock top');
            });

            it('should delegate self', function () {
                expect(contentWindow.self).toBe('mock self');
            });

            it('should delegate parent', function () {
                expect(contentWindow.parent).toBe('mock parent');
            });

            it('should delegate opener', function () {
                expect(contentWindow.opener).toBe('mock opener');
            });

            it('should delegate location', function () {
                expect(contentWindow.location).toBe('mock location');
            });

            it('should delegate length', function () {
                expect(contentWindow.length).toBe('mock length');
            });

            it('should delegate frames', function () {
                expect(contentWindow.frames).toBe('mock frames');
            });

            it('should delegate closed', function () {
                expect(contentWindow.closed).toBe('mock closed');
            });

            it('should delegate close', function () {
                wrapped.close();
                expect(contentWindow.close).toHaveBeenCalled();
            });

            it('should delegate focus', function () {
                wrapped.focus();
                expect(contentWindow.focus).toHaveBeenCalled();
            });

            it('should delegate postMessage', function () {
                wrapped.postMessage('foo', '*');
                expect(contentWindow.postMessage).toHaveBeenCalledWith('foo', '*');
            });

            it('should delegate blur', function () {
                wrapped.blur();
                expect(contentWindow.blur).toHaveBeenCalled();
            });
        });

        describe.only('unwrapping', function () {
            it('should return original object', function () {
                class MyComponent extends Element {
                    getContentWindow() {
                        return this.root.querySelector('iframe').contentWindow;
                    }
                    render() {
                        return () => [api.h('iframe', { src: 'https://salesforce.com' }, [])]
                    }
                }
                MyComponent.publicMethods = ['getContentWindow'];

                const elm = createElement('x-foo', { is: MyComponent });
                document.body.appendChild(elm);
                const iframeContentWindow = elm.getContentWindow();
                expect(document.querySelector('iframe').contentWindow === unwrap(iframeContentWindow)).toBe(true);
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
