/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Testing component: custom-input', () => {
    const URL = 'http://localhost:4567/custom-input';

    before(() => {
        browser.url(URL);
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.strictEqual(title, 'custom-input');
    });

    it('clicking force button should update value', function() {
        const button = browser.element('button');
        const input = browser.element('input[type="range"]');

        button.click();
        browser.waitUntil(() => {
            return browser.getText('h2') === '100' && input.getValue() === '100';
        });
        assert.strictEqual(browser.getText('h2'), '100');
        assert.strictEqual(input.getValue(), '100');
    });
});
