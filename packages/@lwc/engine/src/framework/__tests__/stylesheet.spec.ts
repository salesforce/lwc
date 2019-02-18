/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';

import { createElement, LightningElement } from '../main';

const styledTemplate = compileTemplate(`
    <template>
        <section>Styled template</section>
        <p></p>
    </template>
`);

styledTemplate.stylesheetTokens = {
    hostAttribute: 'test-host',
    shadowAttribute: 'test',
};

styledTemplate.stylesheets = [
    (hostToken, shadowToken) => {
        return `
        ${hostToken} { color: red; }
        section${shadowToken} { color: blue; }
    `;
    },
];

const unstyledTemplate = compileTemplate(`
    <template>
        <section>Unstyled template</section>
        <p></p>
    </template>
`);

describe('synthetic shadow', () => {
    it('adds shadow attribute to all the HTMLElements produced by the template', () => {
        class Component extends LightningElement {
            render() {
                return styledTemplate;
            }
        }

        const elm = createElement('x-cmp', { is: Component });
        document.body.appendChild(elm);

        const shadowRoot = elm.shadowRoot;
        expect(shadowRoot.querySelector('section').hasAttribute('test')).toBe(true);
        expect(shadowRoot.querySelector('p').hasAttribute('test')).toBe(true);
    });

    it('adds host attribute on the host element', () => {
        class Component extends LightningElement {
            render() {
                return styledTemplate;
            }
        }

        const elm = createElement('x-cmp', { is: Component });
        document.body.appendChild(elm);

        expect(elm.hasAttribute('test-host')).toBe(true);
    });

    it('should not insert a style tag if the template has a stylesheet', () => {
        class Component extends LightningElement {
            render() {
                return unstyledTemplate;
            }
        }

        const elm = createElement('x-cmp', { is: Component });
        document.body.appendChild(elm);

        let firstChild;
        // Synthetic shadowRoot doesn't support firstChildElement, we will use the firstChild for now.
        firstChild = elm.shadowRoot.firstChild as HTMLElement;
        expect(firstChild.tagName).toBe('SECTION');
    });

    it('should not insert a style tag if the template has a stylesheet (synthetic shadow)', () => {
        class Component extends LightningElement {
            render() {
                return styledTemplate;
            }
        }

        const elm = createElement('x-cmp', { is: Component });
        document.body.appendChild(elm);

        let firstChild;
        // Synthetic shadowRoot doesn't support firstChildElement, we will use the firstChild for now.
        firstChild = elm.shadowRoot.firstChild as HTMLElement;
        expect(firstChild.tagName).toBe('SECTION');
    });

    it('should remove the attribute if a styled template is replace with an unstyled template', () => {
        class Component extends LightningElement {
            render() {
                return this.tmpl;
            }
        }
        Component.publicProps = {
            tmpl: 0,
        };

        const elm = createElement('x-cmp', { is: Component });
        elm.tmpl = styledTemplate;
        document.body.appendChild(elm);

        const shadowRoot = elm.shadowRoot;
        expect(elm.hasAttribute('test-host')).toBe(true);
        expect(shadowRoot.querySelectorAll('[test]').length).toBeGreaterThan(0);

        elm.tmpl = unstyledTemplate;
        return Promise.resolve().then(() => {
            expect(elm.hasAttribute('test-host')).toBe(false);
            expect(shadowRoot.querySelectorAll('[test]').length).toBe(0);
        });
    });

    it('should update the attributes when replacing a styled template with a different one', () => {
        const tmpl1 = compileTemplate(`
            <template>
                <section>tmpl1</section>
            </template>
        `);
        tmpl1.stylesheets = [() => ``];
        tmpl1.stylesheetTokens = {
            hostAttribute: 'tmpl1-host',
            shadowAttribute: 'tmpl1',
        };

        const tmpl2 = compileTemplate(`
            <template>
                <section>tmpl2</section>
            </template>
        `);
        tmpl2.stylesheets = [() => ``];
        tmpl2.stylesheetTokens = {
            hostAttribute: 'tmpl2-host',
            shadowAttribute: 'tmpl2',
        };

        class Component extends LightningElement {
            render() {
                return this.tmpl;
            }
        }
        Component.publicProps = {
            tmpl: 0,
        };

        const elm = createElement('x-cmp', { is: Component });
        elm.tmpl = tmpl1;
        document.body.appendChild(elm);

        const shadowRoot = elm.shadowRoot;
        expect(elm.hasAttribute('tmpl1-host')).toBe(true);
        expect(shadowRoot.querySelectorAll('[tmpl1]').length).toBeGreaterThan(0);

        elm.tmpl = tmpl2;
        return Promise.resolve().then(() => {
            expect(elm.hasAttribute('tmpl2-host')).toBe(true);
            expect(shadowRoot.querySelectorAll('[tmpl2]').length).toBeGreaterThan(0);
        });
    });
});
