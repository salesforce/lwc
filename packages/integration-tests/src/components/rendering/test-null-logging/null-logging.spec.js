/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Issue 720: Wrap all string literal variables with toString method', () => {
    const URL = 'http://localhost:4567/null-logging';

    before(() => {
        browser.url(URL);
    });

    it('should not have have an error accessing state.foo', function() {
        const hasError = browser.execute(function() {
            return document
                .querySelector('integration-null-logging')
                .shadowRoot.querySelectorAll('.has-error');
        });
        const noError = browser.execute(function() {
            return document
                .querySelector('integration-null-logging')
                .shadowRoot.querySelectorAll('.no-error');
        });
        assert.deepEqual(hasError.value.length, 0);
        assert.deepEqual(noError.value.length, 1);
    });
});
