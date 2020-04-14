/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/delegates-focus-click-target-natively-non-focusable';

describe('when the click target is natively non-focusable', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should apply focus to natively focusable parent (button) when click target is custom element', () => {
        const input = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-click-target-natively-non-focusable')
                .shadowRoot.querySelector('.head');
        });
        input.click();

        // Click on the custom element wrapped by the button
        const child = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-click-target-natively-non-focusable')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('button > integration-child');
        });
        child.click();

        const className = browser.execute(function () {
            return document
                .activeElement.shadowRoot.activeElement.shadowRoot.activeElement.className;
        });

        // The invalid behavior described in issue #1382 causes focus to land on input.tail
        assert.equal(className, 'integration-child-button');
    });

    it('should apply focus to natively focusable parent (button) when click target is span element', () => {
        const input = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-click-target-natively-non-focusable')
                .shadowRoot.querySelector('.head');
        });
        input.click();

        // Click on the span wrapped by the button
        const span = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-click-target-natively-non-focusable')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('button > span');
        });
        span.click();

        const className = browser.execute(function () {
            return document
                .activeElement.shadowRoot.activeElement.shadowRoot.activeElement.className;
        });

        // The invalid behavior described in issue #1382 causes focus to land on input.tail
        assert.equal(className, 'span-button');
    });
});
