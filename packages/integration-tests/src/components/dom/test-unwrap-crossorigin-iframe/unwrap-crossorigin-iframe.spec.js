/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Cross-origin contentWindow communication', () => {
    const URL = 'http://localhost:4567/unwrap-crossorigin-iframe';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should not throw error', function () {
        const button = browser.element('button');
        button.click();
        const text = browser.element('.error');
        assert.equal(text.getText(), 'no error');
    });
});
