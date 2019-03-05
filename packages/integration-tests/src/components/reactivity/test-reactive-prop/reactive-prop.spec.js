/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Testing reactive proxy rehydration', () => {
    const URL = 'http://localhost:4567/reactive-prop';

    before(() => {
        browser.url(URL);
    });

    it('should rehydrate template when hasOwnProperty is called on tracked object', () => {
        const button = browser.element('.b_ownprop');
        const span = browser.element('.s_ownprop');
        button.click();
        assert.deepEqual(span.getText(), 'true');
    });

    it('should rehydrate template when new property has been defined via Object.defineProperty', () => {
        const button = browser.element('.b_defprop');
        const span = browser.element('.s_defprop');
        button.click();
        assert.deepEqual(span.getText(), 'true');
    });

    it('should rehydrate template when property has been deleted from tracked object', () => {
        const button = browser.element('.b_deleteprop');
        const span = browser.element('.s_deleteprop');
        button.click();
        assert.deepEqual(span.getText(), 'false');
    });

    it('should rehydrate template when enumerable attribute of a tracked property has changed', () => {
        const button = browser.element('.b_enumerable');
        const span = browser.element('.s_enumerable');
        button.click();
        assert.deepEqual(span.getText(), '');
    });
});
