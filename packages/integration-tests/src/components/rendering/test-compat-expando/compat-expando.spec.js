/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Testing component: compat-simple', () => {
    const COMPAT_SIMPLE_URL = '/compat-expando';

    it('page load', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const title = browser.getTitle();
        assert.equal(title, 'compat-expando');
    });
});
