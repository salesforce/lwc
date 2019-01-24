/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../main';
import { compileTemplate } from 'test-utils';

describe('upgrade', () => {
    describe('#createElement()', () => {
    describe('patches for Node.', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        it('appendChild()', () => {
            const el = document.createElement('div');
            expect(document.body.appendChild(el)).toBe(el);
            expect(el.parentNode).toBe(document.body);
        });

        it('insertBefore()', () => {
            const el = document.createElement('div');
            const anchor = document.createElement('p');
            document.body.appendChild(anchor);
            expect(document.body.insertBefore(el, anchor)).toBe(el);
            expect(document.body.firstChild).toBe(el);
        });

        it('removeChild()', () => {
            const el = document.createElement('div');
            document.body.appendChild(el);
            expect(document.body.removeChild(el)).toBe(el);
            expect(el.parentNode).toBeNull();
        });

        it('replaceChild()', () => {
            const el = document.createElement('div');
            const anchor = document.createElement('p');
            document.body.appendChild(anchor);
            expect(document.body.replaceChild(el, anchor)).toBe(anchor);
            expect(document.body.childNodes[0]).toBe(el);
            expect(document.body.childNodes.length).toBe(1);
        });
    });

    describe('patches for Element', () => {
        it('should patch querySelector', () => {
            class Root extends LightningElement {
                render() {
                    return compileTemplate(`
                        <template>
                            <p>Paragraph</p>
                        </template>
                    `);
                }
            }

            const el = createElement('x-foo', { is: Root });
            document.body.appendChild(el);
            expect(el.querySelector('p')).toBeNull();
        });

        it('should patch shadowRoot', () => {
            let root
            class Root extends LightningElement {
                connectedCallback() {
                    root = this.template
                }
                render() {
                    return compileTemplate(`
                        <template>
                            <p>Paragraph</p>
                        </template>
                    `);
                }
            }

            const el = createElement('x-foo', { is: Root });
            document.body.appendChild(el);
            expect(el.shadowRoot).toBe(root)
        });
    });
});
