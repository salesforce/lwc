import { createElement, Element } from '../main';
import { getHostShadowRoot } from '../html-element';

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
            function html($api) {
                calls.push('root:render');
                return [$api.c('x-child', Child, {})];
            }
            class Root extends Element {
                constructor() {
                    super();
                    calls.push('root:constructor');
                }
                connectedCallback() {
                    calls.push('root:connectedCallback');
                }
                render() {
                    return html;
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

        it('should destroy children in order', () => {
            const calls = [];
            function html($api, $cmp) {
                calls.push('root:render');
                return [
                    $api.h("div", { key: 3 },
                    [$cmp.state.show ? $api.c('x-child', Child, {}) : null]
                )];
            }
            class Root extends Element {
                state = {
                    show: false
                };
                show() {
                    this.state.show = true;
                }
                hide() {
                    this.state.show = false;
                }
                render() {
                    return html;
                }
                renderedCallback() {
                    calls.push('root:renderedCallback');
                }
            }
            Root.publicMethods = ['show', 'hide'];
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
                disconnectedCallback() {
                    calls.push('child:disconnectedCallback');
                }
            }

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            calls.length = 0;
            elm.show();

            return Promise.resolve().then(() => {
                elm.hide();
                return Promise.resolve().then(() => {
                    expect(calls).toEqual([
                        'root:render',
                        'child:constructor',
                        'child:connectedCallback',
                        'child:render',
                        'child:renderedCallback',
                        'root:renderedCallback',
                        'root:render',
                        'child:disconnectedCallback',
                        'root:renderedCallback'
                    ]);
                });
            });
        });

        it('should call the lifecycle hooks in the right order on update', () => {
            const calls = [];
            function html($api, $cmp) {
                calls.push('root:render');
                return $cmp.state.show
                    ? [$api.c('x-child', Child, {})]
                    : [];
            }
            class Root extends Element {
                state = {
                    show: false
                };
                show() {
                    this.state.show = true;
                }
                render() {
                    return html;
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
                ]);
            });
        });

        it('should rehydrate when state is updated in renderedCallback', function() {
            function html($api, $cmp) {
                return [$api.h('span', { key: 0 }, [$api.t($cmp.state.foo)])];
            }
            class MyComponent extends Element {
                state = {
                    foo: 'bar'
                };
                renderedCallback() {
                    if (this.state.foo !== 'second') {
                        this.state.foo = 'modified';
                    }
                }

                triggerRender(text) {
                    this.state.foo = text;
                }

                render() {
                    return html;
                }
            }
            MyComponent.track = { state: 1 };
            MyComponent.publicMethods = [
                'triggerRender'
            ];

            const element = createElement('x-parent', { is: MyComponent });
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                element.triggerRender('first');
                return Promise.resolve();
            })
            .then(() => {
                element.triggerRender('second');
                return Promise.resolve();
            })
            .then(() => {
                expect(getHostShadowRoot(element).querySelector('span').textContent).toBe('second');
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
            const elm1 = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm1);
            const elm2 = createElement('x-bar', { is: MyComponent2 });
            document.body.appendChild(elm2);
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
            const elm1 = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm1);
            document.body.removeChild(elm1);
            expect(chars).toBe('^connected:rendered:disconnected:');
        });

    });
});
