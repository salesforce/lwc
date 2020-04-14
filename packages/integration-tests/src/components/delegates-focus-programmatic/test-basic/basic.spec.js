/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/basic';

describe('basic invocation', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should focus on the first programmatically focusable element', function () {
        const button = browser.$(function () {
            return document.querySelector('integration-basic').shadowRoot.querySelector('button');
        });
        button.click();
        const className = browser.execute(function () {
            const container = document.activeElement;
            const child = container.shadowRoot.activeElement;
            return child.shadowRoot.activeElement.className;
        });
        assert.equal(className, 'internal-input');
    });
});
