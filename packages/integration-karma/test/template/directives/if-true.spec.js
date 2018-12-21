/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement, LightningElement, api } from 'lwc';
import { html } from 'test-utils';

it('directive if:true', () => {
    const template = html`
        <template>
            <template if:true={isVisible}>
                <p>I am visible!</p>
            </template>
        </template>
    `;

    const template1 = html`
        <template>
            <template if:true={isVisible}>
                <p>I am visible!</p>
            </template>
        </template>
    `;

    class XTest extends LightningElement {
        @api isVisible = false;

        render() {
            return template();
        }
    }

    const elm = createElement('x-test', { is: XTest });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('p')).toBeNull();

    elm.isVisible = true;
    return Promise.resolve()
        .then(() => {
            const paragraph = elm.shadowRoot.querySelector('p');
            expect(paragraph).not.toBeNull();
            expect(paragraph.textContent).toBe('I am visible!');

            elm.isVisible = false;
        })
        .then(() => {
            expect(elm.shadowRoot.querySelector('p')).toBeNull();
        });
});
