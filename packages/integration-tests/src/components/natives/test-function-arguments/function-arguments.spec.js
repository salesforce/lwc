/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Function arguments', () => {
    const URL = 'http://localhost:4567/function-arguments';

    before(() => {
        browser.url(URL);
    });

    it('should have correct message', () => {
        const element = browser.element('.message-assert');
        assert.strictEqual(element.getText(), 'bar');
    });

    it('should iterate correctly', () => {
        const elements = browser.elements('.iterate-list li');
        assert.strictEqual(elements.value[0].getText(), '2');
        assert.strictEqual(elements.value[1].getText(), '3');
        assert.strictEqual(elements.value[2].getText(), '4');
    });
});
