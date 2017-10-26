import * as target from '../patch';
import * as api from "../api";
import { Element } from "../html-element";
import { createElement } from "../main";

describe('patch', () => {

    describe('#patch()', () => {

        it('should call connectedCallback syncronously', () => {
            let flag = false;
            class MyComponent extends Element {
                connectedCallback() {
                    flag = true;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(flag).toBeTruthy();
        });

        it('should call disconnectedCallback syncronously', () => {
            let flag = false;
            class MyComponent extends Element {
                disconnectedCallback() {
                    flag = true;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(flag).toBeTruthy();
        });

        it('should call renderedCallback syncronously', () => {
            let flag = false;
            class MyComponent extends Element {
                renderedCallback() {
                    flag = true;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(flag).toBeTruthy();
        });

        it('should call the lifecycle hooks in the right order at insertion', () => {
            const calls = [];

            class Root extends Element {
                constructor() {
                    super();
                    calls.push('root:constructor');
                }
                connectedCallback() {
                    calls.push('root:connectedCallback');
                }
                render() {
                    return function($api) {
                        calls.push('root:render');
                        return [$api.c('x-child', Child, {})];
                    };
                }
                renderedCallback() {
                    calls.push('root:renderedCallback');
                }
            }

            class Child extends Element {
                constructor() {
                    super();
                    calls.push('child:constructor');
                }
                connectedCallback() {
                    calls.push('child:connectedCallback');
                }
                render() {
                    calls.push('child:render');
                }
                renderedCallback() {
                    calls.push('child:renderedCallback');
                }
            }

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            expect(calls).toEqual([
                'root:constructor',
                'root:connectedCallback',
                'root:render',
                'child:constructor',
                'child:connectedCallback',
                'child:render',
                'child:renderedCallback',
                'root:renderedCallback'
            ]);
        });

        it('should call the lifecycle hooks in the right order on update', () => {
            const calls = [];

            class Root extends Element {
                state = {
                    show: false
                };
                show() {
                    this.state.show = true;
                }
                render() {
                    return function($api, $cmp) {
                        calls.push('root:render');
                        return $cmp.state.show
                            ? [$api.c('x-child', Child, {})]
                            : [];
                    };
                }
                renderedCallback() {
                    calls.push('root:renderedCallback');
                }
            }
            Root.publicMethods = ['show'];
            Root.track = { state: 1 };

            class Child extends Element {
                constructor() {
                    super();
                    calls.push('child:constructor');
                }
                connectedCallback() {
                    calls.push('child:connectedCallback');
                }
                render() {
                    calls.push('child:render');
                }
                renderedCallback() {
                    calls.push('child:renderedCallback');
                }
            }

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            calls.length = 0;
            elm.show();

            return Promise.resolve().then(() => {
                expect(calls).toEqual([
                    'root:render',
                    'child:constructor',
                    'child:connectedCallback',
                    'child:render',
                    'child:renderedCallback',
                    'root:renderedCallback'
                ])
            });
        });

        it('should rehydrate when state is updated in renderedCallback', function () {
            class MyComponent extends Element {
                state = {
                    foo: 'bar'
                }
                renderedCallback() {
                    if (this.state.foo !== 'second') {
                        this.state.foo = 'modified';
                    }
                }

                triggerRender(text) {
                    this.state.foo = text;
                }

                render() {
                    return function ($api, $cmp) {
                        return [$api.h('span', {}, [$api.t($cmp.state.foo)])];
                    }
                }
            }
            MyComponent.track = { state: 1 };
            MyComponent.publicMethods = [
                'triggerRender'
            ]

            const element = createElement('x-parent', { is: MyComponent });
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                element.triggerRender('first');
                return Promise.resolve()
            })
            .then(() => {
                element.triggerRender('second');
                return Promise.resolve();
            })
            .then(() => {
                expect(element.querySelector('span').textContent).toBe('second');
            });
        });

        it('should preserve the creation order and the hook order', () => {
            let chars = '^';
            class MyComponent1 extends Element {
                connectedCallback() {
                    chars += 'connected-1:';
                }
                renderedCallback() {
                    chars += 'rendered-1:';
                }
            }
            class MyComponent2 extends Element {
                connectedCallback() {
                    chars += 'connected-2:';
                }
                renderedCallback() {
                    chars += 'rendered-2:';
                }
            }
            const elm1 = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', MyComponent1, {});
            target.patch(elm1, vnode1);
            const elm2 = document.createElement('x-bar');
            const vnode2 = api.c('x-bar', MyComponent2, {});
            target.patch(elm2, vnode2);
            expect(chars).toBe('^connected-1:rendered-1:connected-2:rendered-2:');
        });

        it('should disconnect when mounting a different element', () => {
            let chars = '^';
            class MyComponent1 extends Element {
                connectedCallback() {
                    chars += 'connected:';
                }
                disconnectedCallback() {
                    chars += 'disconnected:';
                }
                renderedCallback() {
                    chars += 'rendered:';
                }
            }
            const elm1 = document.createElement('x-foo');
            document.body.appendChild(elm1);
            const vnode1 = api.c('x-foo', MyComponent1, {});
            target.patch(elm1, vnode1);
            const vnode2 = api.h('div', {}, []);
            target.patch(vnode1, vnode2);\
            expect(chars).toBe('^connected:rendered:disconnected:');
        });

    });
});
