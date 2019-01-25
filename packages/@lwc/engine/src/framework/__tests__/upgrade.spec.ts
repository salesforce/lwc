/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../main';
import { compileTemplate } from 'test-utils';

describe('upgrade', () => {
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
