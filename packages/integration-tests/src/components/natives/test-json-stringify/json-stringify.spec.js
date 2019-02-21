/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('JSON.stringify on proxies', () => {
    const URL = 'http://localhost:4567/json-stringify';

    before(() => {
        browser.url(URL);
    });

    it('should return proper value for simple object', function() {
        const element = browser.element('.object-stringify');
        assert.strictEqual(element.getText(), '{"x":"x","y":"y"}');
    });

    it('should return proper value for simple array', function() {
        const element = browser.element('.array-stringify');
        assert.strictEqual(element.getText(), '[1,2]');
    });

    it('should return proper value for complex object', function() {
        const element = browser.element('.complex-object-stringify');
        assert.strictEqual(
            element.getText(),
            '{"string":"x","number":1,"boolean":true,"null":null,"object":{"x":"x"}}'
        );
    });

    it('should return proper value for nested proxies', function() {
        const element = browser.element('.nested-object-stringify');
        assert.strictEqual(element.getText(), '{"x":{"y":true},"z":[false]}');
    });
});
