/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../main';

describe('module/events', () => {
    it('attaches click event handler to element', function() {
        const result: Event[] = [];

        const html = compileTemplate(`
            <template>
                <div onclick={handleClick}></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            handleClick(evt) {
                result.push(evt);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('div').click();

        expect(result).toHaveLength(1);
    });

    it('does not attach new listener', function() {
        const result = [];
        let second = false;

        const firstTmpl = compileTemplate(`
            <template>
                <div onclick={clickOne}></div>
            </template>
        `);
        const secondTmpl = compileTemplate(`
            <template>
                <div onclick={clickTwo}></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            counter = 0;

            render() {
                if (this.counter === 0) {
                    return firstTmpl;
                } else {
                    second = true;
                    return secondTmpl;
                }
            }
            clickOne() {
                result.push(1);
            }
            clickTwo() {
                result.push(2);
            }
        }
        MyComponent.publicProps = {
            counter: 1,
        };

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('div').click();

        elm.counter += 1;
        return Promise.resolve().then(() => {
            elm.shadowRoot.querySelector('div').click();
            expect(second).toBe(true);
            expect(result).toEqual([1, 2]);
        });
    });

    it('should reuse the listener', function() {
        const result = [];
        let second = false;

        const firstTmpl = compileTemplate(`
            <template>
                <p onclick={clicked}></p>
            </template>
        `);
        const secondTmpl = compileTemplate(`
            <template>
                <div onclick={clicked}></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            counter = 0;

            clicked() {
                result.push(1);
            }

            render() {
                if (this.counter === 0) {
                    return firstTmpl;
                } else {
                    second = true;
                    return secondTmpl;
                }
            }
        }
        MyComponent.publicProps = {
            counter: 1,
        };

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('p').click();

        elm.counter += 1;
        return Promise.resolve().then(() => {
            expect(second).toBe(true);
            elm.shadowRoot.querySelector('div').click();
            expect(result).toEqual([1, 1]);
        });
    });

    it('must not expose the virtual node to the event handler', function() {
        let cmp;
        const result = [];

        const html = compileTemplate(`
            <template>
                <div onclick={clicked}></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            constructor() {
                super();
                cmp = this;
            }

            clicked() {
                result.push(this);
                result.push.apply(result, arguments);
            }

            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('div').click();

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(cmp);
        expect(result[1]).toBeInstanceOf(Event);
    });

    it('attaches click event handler to custom element', function() {
        const result = [];

        class MyChild extends LightningElement {}

        const html = compileTemplate(
            `
            <template>
                <x-child onclick={handleClick}></x-child>
            </template>
        `,
            {
                modules: { 'x-child': MyChild },
            },
        );
        class MyComponent extends LightningElement {
            handleClick(evt) {
                result.push(evt);
            }

            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('x-child').click();

        expect(result).toHaveLength(1);
    });

    it('attaches custom event handler to custom element', function() {
        const result = [];

        class MyChild extends LightningElement {}

        const html = compileTemplate(
            `
            <template>
                <x-child ontest={handleTest}></x-child>
            </template>
        `,
            {
                modules: { 'x-child': MyChild },
            },
        );
        class MyComponent extends LightningElement {
            handleTest(ev) {
                result.push(ev);
            }

            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('x-child').dispatchEvent(new CustomEvent('test', {}));

        expect(result).toHaveLength(1);
    });
});
