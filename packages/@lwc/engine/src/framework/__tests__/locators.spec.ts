/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, register, LightningElement } from '../main';

describe('Locators & Located Service', () => {
    it('click triggered and locator logged', () => {
        let clickCount = 0;
        let interaction;
        let childCmp;
        const expectedValue = 20;
        const expectedTarget = 'play-button';
        const expectedScope = 'play-control';

        const childHtml = compileTemplate(`
            <template>
                <button locator:id="${expectedTarget}" onclick={handleClick}></button>
            </template>
        `);

        class Child extends LightningElement {
            constructor() {
                super();
                childCmp = this;
            }
            handleClick() {
                clickCount++;
            }
            render() {
                return childHtml;
            }
        }

        const parentHtml = compileTemplate(
            `
            <template>
                <x-child locator:id="${expectedScope}" locator:context={getParentState}></x-child>
            </template>
        `,
            {
                modules: {
                    'x-child': Child,
                },
            },
        );

        class Parent extends LightningElement {
            foo = 10;

            constructor() {
                super();
                this.foo = expectedValue;
            }

            render() {
                return parentHtml;
            }

            getParentState() {
                return { key: this.foo };
            }
        }

        register({
            locator: function(component, data, def, context) {
                const { target, host, targetContext, hostContext } = context.locator.resolved;
                interaction = {
                    target: target,
                    scope: host,
                    context: Object.assign(targetContext || {}, hostContext),
                };
            },
        });
        const elem = createElement('x-parent', { is: Parent });
        document.body.appendChild(elem);
        childCmp.template.querySelector('button').click();
        expect(clickCount).toBe(1);
        expect(interaction).toEqual({
            target: expectedTarget,
            scope: expectedScope,
            context: { key: expectedValue },
        });
    });

    it('locators logged with slots skips slot container', () => {
        let clickCount = 0;
        let interaction;
        let parentCmp;
        const expectedParentValue = 20;
        const expectedGrandParentValue = 30;
        const expectedTarget = 'play-button';
        const expectedScope = 'play-control';

        const childHtml = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);

        class Child extends LightningElement {
            render() {
                return childHtml;
            }
        }

        const parentHtml = compileTemplate(
            `
            <template>
                <x-child locator:id="ignore-me">
                    <button onclick={handleClick}
                            locator:id="${expectedTarget}"
                            locator:context={getParentState}>
                    </button>
                </x-child>
            </template>
        `,
            {
                modules: {
                    'x-child': Child,
                },
            },
        );

        class Parent extends LightningElement {
            foo;
            constructor() {
                super();
                this.foo = expectedParentValue;
                parentCmp = this;
            }
            handleClick() {
                clickCount++;
            }
            render() {
                return parentHtml;
            }
            getParentState() {
                return { parentKey: this.foo };
            }
        }

        const grandParentHtml = compileTemplate(
            `
            <template>
                <x-parent locator:id="${expectedScope}"
                          locator:context={getGrandParentState}>
                </x-parent>
            </template>
        `,
            {
                modules: {
                    'x-parent': Parent,
                },
            },
        );
        class GrandParent extends LightningElement {
            bar;
            constructor() {
                super();
                this.bar = expectedGrandParentValue;
            }
            render() {
                return grandParentHtml;
            }
            getGrandParentState() {
                return { grandParentKey: this.bar };
            }
        }

        register({
            locator: function(component, data, def, context) {
                const { target, host, targetContext, hostContext } = context.locator.resolved;
                interaction = {
                    target: target,
                    scope: host,
                    context: Object.assign(targetContext || {}, hostContext),
                };
            },
        });
        const elem = createElement('x-grand-parent', { is: GrandParent });
        document.body.appendChild(elem);
        parentCmp.template.querySelector('button').click();
        expect(clickCount).toBe(1);
        expect(interaction).toEqual({
            target: expectedTarget,
            scope: expectedScope,
            context: { parentKey: expectedParentValue, grandParentKey: expectedGrandParentValue },
        });
    });

    it('missing locator on parent does not result in a located service callback', () => {
        let clickCount = 0;
        let locatedServiceTriggered = false;
        let childCmp;

        const childHtml = compileTemplate(`
            <template>
                <button locator:id="ignore-me" onclick={handleClick}></button>
            </template>
        `);

        class Child extends LightningElement {
            constructor() {
                super();
                childCmp = this;
            }
            handleClick() {
                clickCount++;
            }
            render() {
                return childHtml;
            }
        }

        const parentHtml = compileTemplate(
            `
            <template>
                <x-child></x-child>
            </template>
        `,
            {
                modules: {
                    'x-child': Child,
                },
            },
        );

        class Parent extends LightningElement {
            constructor() {
                super();
            }

            render() {
                return parentHtml;
            }
        }

        register({
            locator: function() {
                locatedServiceTriggered = true;
            },
        });
        const elem = createElement('x-parent', { is: Parent });
        document.body.appendChild(elem);
        childCmp.template.querySelector('button').click();
        expect(clickCount).toBe(1);
        expect(locatedServiceTriggered).toBe(false);
    });
});

describe('Errors in locators', () => {
    it('locator:context callback error is unhandled and prevents actual click handler from executing', () => {
        let clickCount = 0;
        let exceptionLogged = false;
        let interactionLogged = false;
        let childCmp;
        const expectedValue = 20;
        const expectedTarget = 'play-button';
        const expectedScope = 'play-control';

        const childHtml = compileTemplate(`
            <template>
                <button locator:id="${expectedTarget}" onclick={handleClick}></button>
            </template>
        `);

        class Child extends LightningElement {
            constructor() {
                super();
                childCmp = this;
            }
            handleClick() {
                clickCount++;
            }
            render() {
                return childHtml;
            }
        }

        const parentHtml = compileTemplate(
            `
            <template>
                <x-child locator:id="${expectedScope}" locator:context={getParentState}></x-child>
            </template>
        `,
            {
                modules: {
                    'x-child': Child,
                },
            },
        );

        class Parent extends LightningElement {
            foo = 10;

            constructor() {
                super();
                this.foo = expectedValue;
            }

            render() {
                return parentHtml;
            }

            getParentState() {
                throw new Error('error in locator:context');
            }
        }

        register({
            locator: function() {
                interactionLogged = true;
            },
        });
        const elem = createElement('x-parent', { is: Parent });
        document.body.appendChild(elem);

        // this global listener is needed so that jsdom can forward
        // the unhandled exception here. It won't be catch-able when calling click
        window.addEventListener('error', evt => {
            exceptionLogged = true;
            // tell jsdom not to log this event to the console which is default behavior
            evt.preventDefault();
        });

        childCmp.template.querySelector('button').click();

        expect(exceptionLogged).toBe(true);
        expect(clickCount).toBe(0);
        expect(interactionLogged).toBe(false);
    });
});
