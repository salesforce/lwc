/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('focus delegation when clicking on form element label', () => {
    const URL = '/delegates-focus-non-focusable-click-target';

    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should apply focus to element associated with label when relatedTarget is null', async () => {
        const label = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-non-focusable-click-target')
                .shadowRoot.querySelector('integration-input')
                .shadowRoot.querySelector('label');
        });
        await label.click();

        const inputClassName = await browser.execute(function () {
            const container = document.activeElement;
            const integrationInput = container.shadowRoot.activeElement;
            const inputClassName = integrationInput.shadowRoot.activeElement.className;
            return inputClassName;
        });

        assert.strictEqual(inputClassName, 'internal');
    });

    it('should apply focus to element associated with label when relatedTarget is non-null', async () => {
        const headInput = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-non-focusable-click-target')
                .shadowRoot.querySelector('.head');
        });
        // Focus on input so that relatedTarget will be non-null
        await headInput.click();

        const label = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-non-focusable-click-target')
                .shadowRoot.querySelector('integration-input')
                .shadowRoot.querySelector('label');
        });
        await label.click();

        const inputClassName = await browser.execute(function () {
            const container = document.activeElement;
            const integrationInput = container.shadowRoot.activeElement;
            const inputClassName = integrationInput.shadowRoot.activeElement.className;
            return inputClassName;
        });

        assert.strictEqual(inputClassName, 'internal');
    });
});
