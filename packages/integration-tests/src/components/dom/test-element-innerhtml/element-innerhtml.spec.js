/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('custom element text content', () => {
    const URL = 'http://localhost:4567/element-innerhtml/';

    before(() => {
        browser.url(URL);
    });

    it('should return correct innerHTML', function () {
        assert.equal(browser.getText('p'), '<div>Slot</div>');
    });
});
