import { Root, wrapIframeWindow } from "../root";
import { Element } from "../html-element";
import { h } from "../api";
import { unwrap } from '../main';
import { createElement } from "../upgrade";
import { ViewModelReflection } from "../def";
import { VM } from "../vm";
import { Component } from "../component";

describe('root', () => {
    describe('#constructor()', () => {

        it('should throw for invalid vm reference', () => {
            expect(() => new Root()).toThrow();
        });

    });

    describe('integration', () => {

        it('should support this.template.host', () => {
            class MyComponent extends Element {}
            const elm = createElement('x-foo', { is: MyComponent });
            const vm = elm[ViewModelReflection] as VM;
            expect(vm.component).toBe((vm.component as Component).root.host);
        });

        it('should support this.template.mode', () => {
            class MyComponent extends Element {}
            const elm = createElement('x-foo', { is: MyComponent });
            const vm = elm[ViewModelReflection] as VM;
            expect((vm.component as Component).root.mode).toBe('closed');
        });

        it('should allow searching for elements from template', () => {
            function html($api) { return [$api.h('p', { key: 0 }, [])]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const nodes = (elm[ViewModelReflection].component as Component).root.querySelectorAll('p');
                expect(nodes).toHaveLength(1);
            });
        });

        it('should allow searching for one element from template', () => {
            function html($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const node = (elm[ViewModelReflection].component as Component).root.querySelector('p');
                expect(node.tagName).toBe('P');
            });
        });

        it('should ignore elements from other owner', () => {
            const vnodeFromAnotherOwner = h('p', { key: 0 }, []);
            function html() { return [vnodeFromAnotherOwner]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const nodes = (elm[ViewModelReflection].component as Component).root.querySelectorAll('p');
                expect(nodes).toHaveLength(0);
            });
        });

        it('should ignore element from other owner', () => {
            const vnodeFromAnotherOwner = h('p', { key: 0 }, []);
            function html() { return [vnodeFromAnotherOwner]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const node = (elm[ViewModelReflection].component as Component).root.querySelector('p');
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
                expect(wrapped.window).toBe('mock window');
            });

            it('should delegate top', function () {
                expect(wrapped.top).toBe('mock top');
            });

            it('should delegate self', function () {
                expect(wrapped.self).toBe('mock self');
            });

            it('should delegate parent', function () {
                expect(wrapped.parent).toBe('mock parent');
            });

            it('should delegate opener', function () {
                expect(wrapped.opener).toBe('mock opener');
            });

            it('should delegate location', function () {
                expect(wrapped.location).toBe('mock location');
            });

            it('should delegate length', function () {
                expect(wrapped.length).toBe('mock length');
            });

            it('should delegate frames', function () {
                expect(wrapped.frames).toBe('mock frames');
            });

            it('should delegate closed', function () {
                expect(wrapped.closed).toBe('mock closed');
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

        describe('unwrapping', function () {
            it('should return original object', function () {
                function html($api) {
                    return [$api.h('iframe', { key: 0, src: 'https://salesforce.com' }, [])];
                }
                class MyComponent extends Element {
                    getContentWindow() {
                        return this.template.querySelector('iframe').contentWindow;
                    }
                    render() {
                        return html;
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
            function html($api) { return [$api.h('ul', { key: 0 }, [$api.h('li', { key: 1 }, [])])]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const ul = (elm[ViewModelReflection].component as Component).template.querySelector('ul');
                expect(ul);
                const li = ul.querySelector('li');
                expect(li);
            });
        });

        it('should not reach into child components template when querySelector invoked on child custom element', () => {
            expect.assertions(1);
            let childTemplate;
            class MyChild extends Element {
                render() {
                    return function ($api) {
                        return [$api.h('div', {
                            key: 0,
                        }, [])];
                    }
                }
            }

            function html($api, $cmp) {
                return [$api.c('membrane-parent-query-selector-child-custom-element-child', MyChild, {})];
            }

            class MyComponent extends Element {
                queryChild() {
                    return this.template.querySelector('membrane-parent-query-selector-child-custom-element-child').querySelector('div');
                }

                render() {
                    return html;
                }
            }

            MyComponent.publicMethods = ['queryChild'];

            const elm = createElement('membrane-parent-query-selector-child-custom-element', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.queryChild()).toBe(null);
        });

        it('should querySelectorAll on element from template', () => {
            function html($api) { return [$api.h('ul', { key: 0 }, [$api.h('li', { key: 1 }, [])])]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const ul = (elm[ViewModelReflection].component as Component).template.querySelectorAll('ul')[0];
                expect(ul);
                const li = ul.querySelectorAll('li')[0];
                expect(li);
            });
        });

        it('should ignore extraneous elements', () => {
            function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const ul = (elm[ViewModelReflection].component as Component).template.querySelector('ul');
                expect(ul);
                ul.appendChild(document.createElement('li'));
                const li1 = ul.querySelectorAll('li')[0];
                expect(li1).toBeUndefined();
                const li2 = ul.querySelector('li');
                expect(li2).toBeNull();
            });
        });

        it('should not throw error if querySelector does not match any elements', () => {
            function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                expect(() => {
                    (elm[ViewModelReflection].component as Component).template.querySelector('doesnotexist');
                }).not.toThrow();
            });
        });

        it('should return null if querySelector does not match any elements', () => {
            function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                expect((elm[ViewModelReflection].component as Component).template.querySelector('doesnotexist')).toBeNull();
            });
        });

        it('should not throw error if querySelectorAll does not match any elements', () => {
            function html($api) {
                return [$api.h('ul', { key: 0 }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                expect(() => {
                    (elm[ViewModelReflection].component as Component).template.querySelectorAll('doesnotexist');
                }).not.toThrow();
            });
        });

        it('should allow walking back to the shadow root', () => {
            function html($api) {
                return [$api.h('div', { key: 0 }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const root = (elm[ViewModelReflection].component as Component).template;
                expect(root.querySelector('div').parentNode).toBe(root);
            });
        });

        it('should not expose shadow root on child custom element', () => {
            expect.assertions(1);
            let childTemplate;
            class MyChild extends Element {
                constructor() {
                    super();
                    childTemplate = this.template;
                }

                clickDiv() {
                    this.template.querySelector('div').click();
                }

                render() {
                    return function ($api) {
                        return [$api.h('div', {
                            key: 0,
                        }, [])];
                    }
                }
            }

            MyChild.publicMethods = ['clickDiv'];

            function html($api, $cmp) {
                return [$api.c('x-child-parent-shadow-root', MyChild, {
                    on: {
                        click: $api.b($cmp.handleClick)
                    }
                })];
            }

            class MyComponent extends Element {
                handleClick(evt) {
                    expect(evt.target.parentNode).not.toBe(childTemplate);
                }

                clickChildDiv() {
                    this.template.querySelector('x-child-parent-shadow-root').clickDiv();
                }

                render() {
                    return html;
                }
            }

            MyComponent.publicMethods = ['clickChildDiv'];

            const elm = createElement('membrane-child-parent-shadow-root-parent', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                elm.clickChildDiv();
            });
        });

    });

});
