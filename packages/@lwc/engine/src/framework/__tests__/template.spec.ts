/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../main';
import { compileTemplate } from 'test-utils';
import { registerTemplate } from '../template';

function createCustomComponent(html) {
    class MyComponent extends LightningElement {
        render() {
            return html;
        }
    }
    const elm = createElement('x-foo', { is: MyComponent });
    document.body.appendChild(elm);
    return elm;
}

describe('template', () => {
    describe('integration', () => {
        it('should render arrays correctly', function() {
            const html = compileTemplate(`
                <template>
                    <template for:each={arr} for:item="item">
                        <div key={item}>{item}</div>
                    </template>
                </template>
            `);
            class Foo extends LightningElement {
                arr = ['a', 'b'];

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);

            expect(
                elm.shadowRoot.querySelectorAll('div').length
            ).toBe(2);
            expect(
                elm.shadowRoot.querySelectorAll('div')[0].textContent
            ).toBe('a');
            expect(
                elm.shadowRoot.querySelectorAll('div')[1].textContent
            ).toBe('b');
        });

        it('should render sets correctly', function() {
            const html = compileTemplate(`
                <template>
                    <template for:each={arr} for:item="item">
                        <div key={item}>{item}</div>
                    </template>
                </template>
            `);
            class Foo extends LightningElement {
                arr = new Set(['a', 'b']);

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);

            expect(
                elm.shadowRoot.querySelectorAll('div').length
            ).toBe(2);
            expect(
                elm.shadowRoot.querySelectorAll('div')[0].textContent
            ).toBe('a');
            expect(
                elm.shadowRoot.querySelectorAll('div')[1].textContent
            ).toBe('b');
        });

        // this test depends on the memoization
        // it('should prevent a getter to be accessed twice in the same render phase', () => {
        //     let counter = 0;
        //     let vnode;
        //     class MyComponent extends Element {
        //         get x() {
        //             counter += 1;
        //         }
        //         get y() {
        //             counter += 1;
        //         }
        //         render() {
        //             return function (api, cmp) {
        //                 cmp.x;
        //                 cmp.y;
        //                 cmp.x;
        //                 cmp.y;
        //                 return [];
        //             };
        //         }
        //     }
        //     const elm = document.createElement('x-foo');
        //     vnode = api.c('x-foo', MyComponent, {});
        //     patch(elm, vnode);
        //     assert.strictEqual(counter, 2);
        // });

        it('should not prevent or cache a getter calling another getter', () => {
            let counter = 0;

            const html = compileTemplate(`
                <template>
                    {x} - {y}
                </template>
            `);
            class MyComponent extends LightningElement {
                get x() {
                    counter += 1;
                    this.y; // accessing another getter
                    return 1;
                }
                get y() {
                    counter += 1;
                    return counter;
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            expect(counter).toBe(3);
        });

        it('should throw when attempting to set a property member of cmp', () => {
            function template(api, cmp) {
                cmp.x = [];
                return [];
            }
            template.ids = ['x'];
            class MyComponent extends LightningElement {
                x = 1;
                render() {
                    return template;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => document.body.appendChild(elm)).toThrow();
        });

        it('should support switching templates', () => {
            let counter = 0;
            let value;
            function html1(api, cmp, slotset, memoizer) {
                memoizer.m0 = memoizer.m0 || cmp.x;
                value = memoizer.m0;
                return [];
            }
            function html2(api, cmp, slotset, memoizer) {
                memoizer.m0 = memoizer.m0 || cmp.x;
                value = memoizer.m0;
                return [];
            }
            class MyComponent2 extends LightningElement {
                render() {
                    counter++;
                    if (counter === 1) {
                        return registerTemplate(html1);
                    }
                    return registerTemplate(html2);
                }
            }
            MyComponent2.publicProps = { x: true };
            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 'one';
            document.body.appendChild(elm);
            elm.x = 'two';
            return Promise.resolve().then(_ => {
                expect(counter).toBe(2);
                expect(value).toBe('two');
            });
        });

        it('should support array of vnode', () => {
            const html = compileTemplate(`<template><span>some text</span></template>`);
            class MyComponent3 extends LightningElement {
                getTextContent() {
                    return this.template.querySelector('span').textContent;
                }
                render() {
                    return html;
                }
            }
            MyComponent3.publicMethods = ['getTextContent'];
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(elm.getTextContent()).toBe('some text');
        });

        it('should profixied default objects', () => {
            const x = [1, 2, 3];

            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    this.x = x;
                }

                getX() {
                    return this.x;
                }
            }

            MyComponent.publicProps = { x: true };
            MyComponent.publicMethods = ['getX'];

            const elm = createElement('x-foo', { is: MyComponent });

            expect(elm.x).toBe(elm.getX());
            expect(elm.x).not.toBe(x);
            expect(elm.x).toEqual(x);
        });

        it('should proxify property objects', () => {
            const x = [1, 2, 3];
            class MyComponent extends LightningElement {}
            MyComponent.publicProps = {
                x: {}
            };
            const elm = createElement('x-foo', { is: MyComponent });
            elm.x = x;
            expect(elm.x).not.toBe(x);
            expect(elm.x).toEqual(x);
        });

        it('should not create a proxy for methods used from template', () => {
            let x, y;
            function html(api, cmp) {
                y = cmp.x;
                return [];
            }
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    x = this.x;
                }
                x() {}
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(typeof x).toBe("function");
            expect(x).toBe(y);
        });

    });

    describe('evaluateTemplate()', () => {
        it('should throw for undefined value', () => {
            expect(() => {
                createCustomComponent(() => undefined)
            }).toThrow();
        });

        it('should throw for null value', () => {
            expect(() => {
                createCustomComponent(() =>  null)
            }).toThrow();
        });
        it('should throw for empty values', () => {
            expect(() => {
                createCustomComponent(() =>  '')
            }).toThrow();
        });

        it('should throw for dom elements', () => {
            const elm = document.createElement('p');
            expect(() => {
                createCustomComponent(() =>  elm)
            }).toThrow();
        });

        it('should throw for array of dom elements', () => {
            const elm = document.createElement('p');
            expect(() => {
                createCustomComponent(() =>  [elm])
            }).toThrow();
        });
    });

    describe('style', () => {
        it('should not render empty style attribute to DOM', () => {
            const html = compileTemplate(`
                <template>
                    <div style={computedStyle}></div>
                </template>
            `);
            class MyComponent extends LightningElement {
                get computedStyle() {
                    return '';
                }

                getInnerHTML() {
                    return this.template.querySelector('div').outerHTML;
                }

                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['getInnerHTML'];

            const element = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(element);

            // there should not be a style="" attribute in the DOM
            expect(element.getInnerHTML()).toBe('<div></div>');
        });
    });

    describe('recycling', () => {
        it('should only occur if the same template is rendered', () => {
            let div;
            let counter = 0;

            const html = compileTemplate(`
                <template>
                    <div>{x}</div>
                </template>
            `);
            class MyComponent extends LightningElement {
                x = 0;
                render() {
                    return html;
                }
                renderedCallback() {
                    counter++;
                    div = this.template.querySelector('div');
                }
            }
            MyComponent.publicProps = { x: 1 };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            expect(counter).toBe(1);

            div.id = 'miami';
            elm.x = 2;
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
                expect(div.id).toBe('miami'); // this means the element was reused
            });
        });

        it('should not occur if the template is swapped', () => {
            let div;
            let counter = 0;

            const html1 = compileTemplate(`
                <template>
                    <div>{x}</div>
                </template>
            `);
            const html2 = compileTemplate(`
                <template>
                    <div>{x}</div>
                </template>
            `);
            class MyComponent extends LightningElement {
                x = 0;
                render() {
                    return this.x === 0 ? html1: html2;
                }
                renderedCallback() {
                    counter++;
                    div = this.template.querySelector('div');
                }
            }
            MyComponent.publicProps = { x: 1 };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            expect(counter).toBe(1);

            div.id = 'miami';
            elm.x = 2;
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
                expect(div.id).toBe(""); // this means the element was not reused
            });
        });
    });

    describe('Attributes', () => {
        it('should render attributes correctly', () => {
            const html = compileTemplate(`
                <template>
                    <div title="foo"></div>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            const element = createElement('x-attr-cmp', { is: MyComponent });
            document.body.appendChild(element);

            const div = element.shadowRoot.querySelector('div');
            expect(div.getAttribute('title')).toBe('foo');
        });

        it('should remove attribute when value is null', () => {
            const html = compileTemplate(`
                <template>
                    <div title={_inner}></div>
                </template>
            `);
            class MyComponent extends LightningElement {
                _inner = 'initial';

                setInner(value) {
                    this._inner = value;
                }
                render() {
                    return html;
                }
            }

            MyComponent.publicMethods = ['setInner'];
            MyComponent.track = {
                _inner: 1,
            };

            const element = createElement('x-attr-cmp', { is: MyComponent });
            document.body.appendChild(element);

            expect(element.shadowRoot.querySelector('div').getAttribute('title')).toBe('initial');
            element.setInner(null);
            return Promise.resolve().then(() => {
                expect(element.shadowRoot.querySelector('div').hasAttribute('title')).toBe(false);
            });
        });
    });
});
