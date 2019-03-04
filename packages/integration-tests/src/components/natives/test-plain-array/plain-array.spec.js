/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Plain array methods', () => {
    const URL = 'http://localhost:4567/plain-array';

    before(() => {
        browser.url(URL);
    });

    it('should display unshifted items correctly', function() {
        const elements = browser.elements('.push-list-plain li');
        assert.strictEqual(elements.value[0].getText(), '1');
        assert.strictEqual(elements.value[1].getText(), '2');
        assert.strictEqual(elements.value[2].getText(), '3');
        assert.strictEqual(elements.value[3].getText(), '4');
    });

    it('should display pushed items correctly', function() {
        const elements = browser.elements('.push-list li');
        assert.strictEqual(elements.value[0].getText(), 'first');
        assert.strictEqual(elements.value[1].getText(), 'second');
        assert.strictEqual(elements.value[2].getText(), 'proxy');
        assert.strictEqual(elements.value[3].getText(), 'fourth');
    });

    it('should display concat items correctly', function() {
        const elements = browser.elements('.concat-list-plain li');
        assert.strictEqual(elements.value[0].getText(), '1');
        assert.strictEqual(elements.value[1].getText(), '2');
        assert.strictEqual(elements.value[2].getText(), '3');
        assert.strictEqual(elements.value[3].getText(), '4');
    });

    it('should display concat items correctly', function() {
        const elements = browser.elements('.concat-list-proxy li');
        assert.strictEqual(elements.value[0].getText(), 'first');
        assert.strictEqual(elements.value[1].getText(), 'second');
        assert.strictEqual(elements.value[2].getText(), 'proxy');
    });
});
