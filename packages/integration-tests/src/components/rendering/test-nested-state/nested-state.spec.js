/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Object keys', () => {
    const URL = 'http://localhost:4567/nested-state';

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function() {
        const element = browser.element('.key');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'yes');
    });
});
