/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Set Prototype Of', () => {
    const URL = 'http://localhost:4567/object-setprototypeof';

    before(() => {
        browser.url(URL);
    });

    it('should have set prototype correctly', function () {
        const element = browser.element('.is-array-prototype');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'true');
    });

    it.skip('should have set proxy prototype correctly', function () {
        const element = browser.element('.proxy-is-document');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'true');
    });

    it('should have ignored proto argument in favor of trap', function () {
        const element = browser.element('.proxy-is-array');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'false');
    });

    it('should have ignored proto argument in favor of trap', function () {
        const element = browser.element('.correct-prototype');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'true');
    });
});
