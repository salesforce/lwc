/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Component with a wired property', () => {
    it('should display data correctly', async () => {
        const todoText = await browser.execute(function () {
            return document
                .querySelector('integration-wired-prop-suite')
                .shadowRoot.querySelector('integration-wired-prop').shadowRoot.textContent;
        });
        assert.strictEqual(todoText, 'Title:task 0 Completed:true');
    });

    it('should update data correctly', async () => {
        const button = await browser.shadowDeep$('integration-wired-prop-suite', 'button');
        await button.click();

        await browser.waitUntil(
            async () => {
                const todoText = await browser.execute(function () {
                    return document
                        .querySelector('integration-wired-prop-suite')
                        .shadowRoot.querySelector('integration-wired-prop').shadowRoot.textContent;
                });
                return todoText === 'Title:task 1 Completed:false';
            },
            undefined,
            'expect todo item to be updated'
        );
    });
});
