import { Element } from "../html-element";
import { createElement } from "../upgrade";
import { getRootNode } from "../dom";

describe('dom', () => {
    describe('getRootNode', () => {
        it.only('should return correct value', () => {
            class MyComponent extends Element {
                trigger() {
                    const event = new CustomEvent('foo', {
                        bubbles: true,
                        composed: true,
                    });

                    this.dispatchEvent(event);
                }
            }
            MyComponent.publicMethods = ['trigger'];

            class Parent extends Element {
                handleFoo(evt) {
                    expect(evt.target).toBe(this.root.querySelector('x-foo'));
                }

                render() {
                    return ($api, $cmp) => {
                        return [
                            $api.h(
                                'div',
                                {
                                    on: {
                                        foo: $api.b($cmp.handleFoo)
                                    },
                                    key: 0,
                                },
                                []
                            )
                        ]
                    }
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = elm.querySelector('div');
            const match = getRootNode.call(child, { composed: true });
            expect(document).toBe(elm)
        });
    });
    describe('composed polyfill', () => {
        it('should get native events as composed true', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('click', function (e) {
                expect(e.composed).toBe(true);
            });
            elm.click();
        });
        // TODO: flapper
        // it('should get custom events as composed false', function () {
        //     expect.assertions(1);
        //     const elm = document.createElement('div');
        //     document.body.appendChild(elm);
        //     elm.addEventListener('bar', function (e) {
        //         expect(e.composed).toBe(false);
        //     });
        //     elm.dispatchEvent(new CustomEvent('bar', {}));
        // });
        it('should allow customization of composed init in custom events', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('foo', function (e) {
                expect(e.composed).toBe(true);
            });
            elm.dispatchEvent(new CustomEvent('foo', { composed: true }));
        });

        it('should handle event.target on events dispatched on custom elements', function () {
            expect.assertions(1);
            class MyComponent extends Element {
                trigger() {
                    const event = new CustomEvent('foo', {
                        bubbles: true,
                        composed: true,
                    });

                    this.dispatchEvent(event);
                }
            }
            MyComponent.publicMethods = ['trigger'];

            class Parent extends Element {
                handleFoo(evt) {
                    expect(evt.target).toBe(this.root.querySelector('x-foo'));
                }

                render() {
                    return ($api, $cmp) => {
                        return [
                            $api.c(
                                'x-foo',
                                MyComponent,
                                {
                                    on: {
                                        foo: $api.b($cmp.handleFoo)
                                    }
                                }
                            )
                        ]
                    }
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = elm.querySelector('x-foo');
            child.trigger();
        });
    });
});
