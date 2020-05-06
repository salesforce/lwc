/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../';

describe('patched node properties', () => {
    describe('parentNode', () => {
        afterEach(() => {
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }
        });
        it('should fetch parentNode of nested root element', () => {
            const nestedRootElementTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
            `);
            class NestedRootElement extends LightningElement {
                render() {
                    return nestedRootElementTmpl;
                }
            }

            const nestedRootElement = createElement('x-nested', { is: NestedRootElement });
            const rootElementTmpl = compileTemplate(`
            <template>
                <div class='expectedParent' lwc:dom="manual"></div>
            </template>
            `);
            class RootElement extends LightningElement {
                render() {
                    return rootElementTmpl;
                }
                renderedCallback() {
                    this.template.querySelector('div').appendChild(nestedRootElement);
                }
            }
            const rootElem = createElement('x-root', { is: RootElement });
            document.body.appendChild(rootElem);
            expect(nestedRootElement.parentNode).not.toBeNull();
            expect(nestedRootElement.parentNode).toBe(
                rootElem.shadowRoot.querySelector('.expectedParent')
            );
        });
        it('should fetch parentNode of nested root element when parent node marked as lwc:dom="manual"', () => {
            const nestedRootElementTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
            `);
            class NestedRootElement extends LightningElement {
                render() {
                    return nestedRootElementTmpl;
                }
            }

            const nestedRootElement = createElement('x-nested', { is: NestedRootElement });
            const rootElementTmpl = compileTemplate(`
            <template>
                <div class='expectedParent' lwc:dom="manual"></div>
            </template>
            `);
            class RootElement extends LightningElement {
                render() {
                    return rootElementTmpl;
                }
                renderedCallback() {
                    this.template.querySelector('div').appendChild(nestedRootElement);
                }
            }
            const rootElem = createElement('x-root', { is: RootElement });
            document.body.appendChild(rootElem);
            expect(nestedRootElement.parentNode).not.toBeNull();
            expect(nestedRootElement.parentNode).toBe(
                rootElem.shadowRoot.querySelector('.expectedParent')
            );
        });
    });
});
