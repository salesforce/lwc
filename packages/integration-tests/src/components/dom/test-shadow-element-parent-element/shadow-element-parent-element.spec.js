/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('parentElement from top-level shadow element', () => {
    const URL = 'http://localhost:4567/shadow-element-parent-element/';

    before(() => {
        browser.url(URL);
    });

    it('should return correct elements', function () {
        assert.equal(browser.getText('.parent-is-correct'), 'Parent is correct');
    });
});
