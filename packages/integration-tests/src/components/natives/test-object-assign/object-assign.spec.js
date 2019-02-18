/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Issue 828 - Object assign', () => {
    const URL = 'http://localhost:4567/object-assign';

    before(() => {
        browser.url(URL);
    });

    it('should return proper value', function() {
        const element = browser.element('.assign');
        assert.strictEqual(element.getText(), 'foo');
    });
});
