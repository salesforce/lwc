/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Default AOM values on Shadow Root', () => {
    const URL = 'http://localhost:4567/pass-null-aria-attribute-to-custom-element';

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function() {
        const hasAttribute = browser.execute(function() {
            return document.querySelector('integration-child').hasAttribute('aria-label');
        });
        assert.equal(hasAttribute.value, false);
    });
});
