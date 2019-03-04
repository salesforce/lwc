/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Array prototype methods', () => {
    const URL = 'http://localhost:4567/array-push-concat-unshift';

    function microTask() {
        browser.executeAsync(function(done) {
            Promise.resolve().then(function() {
                done();
            });
        });
    }

    before(() => {
        browser.url(URL);
    });

    it('should display unshifted items correctly', function() {
        const el = browser.element('.unshift-list');
        el.click();

        microTask();

        const elements = browser.elements('.unshift-list li');
        assert.strictEqual(elements.value[0].getText(), 'unshifted');
        assert.strictEqual(elements.value[1].getText(), 'first');
        assert.strictEqual(elements.value[2].getText(), 'second');
    });

    it('should display pushed items correctly', function() {
        const el = browser.element('.push-list');
        el.click();

        microTask();

        const elements = browser.elements('.push-list li');
        assert.strictEqual(elements.value[0].getText(), 'first');
        assert.strictEqual(elements.value[1].getText(), 'second');
        assert.strictEqual(elements.value[2].getText(), 'pushed');
    });

    it('should display concat items correctly', function() {
        const el = browser.element('.concat-list');
        el.click();

        microTask();

        const elements = browser.elements('.concat-list li');
        assert.strictEqual(elements.value[0].getText(), 'first');
        assert.strictEqual(elements.value[1].getText(), 'second');
        assert.strictEqual(elements.value[2].getText(), 'concat 1');
        assert.strictEqual(elements.value[3].getText(), 'concat 2');
    });

    it('should display concat items correctly', function() {
        const el = browser.element('.prop-concat-list');
        el.click();

        microTask();

        const elements = browser.elements('.prop-concat-list li');
        assert.strictEqual(elements.value[0].getText(), 'concat 1');
        assert.strictEqual(elements.value[1].getText(), 'concat 2');
        assert.strictEqual(elements.value[2].getText(), 'first');
        assert.strictEqual(elements.value[3].getText(), 'second');
    });
});
