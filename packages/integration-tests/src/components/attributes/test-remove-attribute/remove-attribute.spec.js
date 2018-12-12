/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('removeAttribute', () => {
    const URL = 'http://localhost:4567/remove-attribute';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const element = browser.element('integration-remove-attribute');
        assert.equal(element.getAttribute('title'), '');
    });
});
