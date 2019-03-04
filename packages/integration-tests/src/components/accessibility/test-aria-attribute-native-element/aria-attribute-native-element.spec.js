/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Aria attributes on native elements', () => {
    const URL = 'http://localhost:4567/aria-attribute-native-element';

    before(() => {
        browser.url(URL);
    });

    it('should correctly call setter for AOM property', function() {
        const element = browser.element('integration-aria-attribute-native-element div');
        assert.equal(element.getAttribute('aria-label'), 'nativeelement');
    });
});
