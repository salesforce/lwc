/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('focus delegation when clicking on form element label', () => {
    const URL = '/delegates-focus-non-focusable-click-target';

    beforeEach(() => {
        browser.url(URL);
    });

    it('should apply focus to element associated with label when relatedTarget is null', function () {
        const label = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-non-focusable-click-target')
                .shadowRoot.querySelector('integration-input')
                .shadowRoot.querySelector('label');
        });
        label.click();

        const inputClassName = browser.execute(function () {
            const container = document.activeElement;
            const integrationInput = container.shadowRoot.activeElement;
            const inputClassName = integrationInput.shadowRoot.activeElement.className;
            return inputClassName;
        });

        assert.strictEqual(inputClassName, 'internal');
    });

    it('should apply focus to element associated with label when relatedTarget is non-null', function () {
        const headInput = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-non-focusable-click-target')
                .shadowRoot.querySelector('.head');
        });
        // Focus on input so that relatedTarget will be non-null
        headInput.click();

        const label = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-non-focusable-click-target')
                .shadowRoot.querySelector('integration-input')
                .shadowRoot.querySelector('label');
        });
        label.click();

        const inputClassName = browser.execute(function () {
            const container = document.activeElement;
            const integrationInput = container.shadowRoot.activeElement;
            const inputClassName = integrationInput.shadowRoot.activeElement.className;
            return inputClassName;
        });

        assert.strictEqual(inputClassName, 'internal');
    });
});
