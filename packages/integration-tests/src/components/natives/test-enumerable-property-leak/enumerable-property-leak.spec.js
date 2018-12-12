/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Array prototype methods', () => {
    const URL = 'http://localhost:4567/enumerable-property-leak';

    before(() => {
        browser.url(URL);
    });

    it('should not leak any properties on Object', () => {
        const el = browser.element('.object-enumerable-properties');
        assert.strictEqual(el.getText(), 'x,y');
    });

    it('should not leak any properties on Array', () => {
        const el = browser.element('.array-enumerable-properties');
        assert.strictEqual(el.getText(), '0,1');
    });
});
