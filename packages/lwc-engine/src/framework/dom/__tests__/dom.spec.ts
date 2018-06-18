import { createElement, Element } from '../../main';
import { querySelector } from "../element";
import { getRootNode } from "../node";

describe('dom', () => {
    describe('getRootNode composed true', () => {
        it('should return correct value from child node', () => {
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
                    expect(evt.target).toBe(this.template.querySelector('x-foo'));
                }

                render() {
                    return ($api, $cmp) => {
                        return [
                            $api.c(
                                'x-child',
                                MyComponent,
                                {
                                    on: {
                                        foo: $api.b($cmp.handleFoo)
                                    },
                                    key: 0,
                                },
                            )
                        ]
                    }
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = querySelector.call(elm, 'x-child');
            const match = getRootNode.call(child, { composed: true });
            // We can't assert against document directly, because
            // for some reasons, jest is locking up with document here
            expect(match.nodeName).toBe('#document');
        });

        it('should return correct value from self', () => {
            class Parent extends Element {}
            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);

            const match = getRootNode.call(elm, { composed: true });

            expect(match.nodeName).toBe('#document');
        });
    });

    describe('getRootNode composed false', () => {
        it('should return correct value from child node', () => {
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
                    expect(evt.target).toBe(this.template.querySelector('x-foo'));
                }

                render() {
                    return ($api, $cmp) => {
                        return [
                            $api.c(
                                'x-child',
                                MyComponent,
                                {
                                    on: {
                                        foo: $api.b($cmp.handleFoo)
                                    },
                                    key: 0,
                                },
                            )
                        ]
                    }
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = querySelector.call(elm, 'x-child');
            const match = getRootNode.call(child, { composed: false });
            // We can't assert against document directly, because
            // for some reasons, jest is locking up with document here
            expect(match).toBe(elm);
        });

        it('should return correct value from self', () => {
            class Parent extends Element {}
            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);

            const match = getRootNode.call(elm, { composed: false });

            expect(match.nodeName).toBe('#document');
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
        it.skip('should get custom events as composed false', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('bar', function (e) {
                expect(e.composed).toBe(false);
            });
            elm.dispatchEvent(new CustomEvent('bar', {}));
        });

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
                    expect(evt.target).toBe(this.template.querySelector('x-foo'));
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
            const child = querySelector.call(elm, 'x-foo');
            child.trigger();
        });
    });
});
