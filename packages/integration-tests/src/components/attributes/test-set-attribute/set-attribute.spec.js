/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('setAttribute', () => {
    const URL = 'http://localhost:4567/set-attribute';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const element = browser.element('integration-set-attribute');
        assert.equal( element.getAttribute('customattribute'), 'bar');
    });
});
