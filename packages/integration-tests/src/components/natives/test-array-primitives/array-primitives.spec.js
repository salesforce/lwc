/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Testing array primitives', () => {
    const URL = 'http://localhost:4567/array-primitives';

    before(() => {
        browser.url(URL);
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'array-primitives');
    });

    it('check initial state', function () {
        const initialLength = 5;
        const { value } = browser.execute(function () {
            return document.querySelector('integration-array-primitives').shadowRoot.querySelectorAll('li').length
        });

        assert.equal(value, initialLength);
    });

    it('check splice reactivity', function () {
        const splicedList = [ 'one', 'three', 'four', 'five' ];
        const splicedLength = splicedList.length;
        browser.execute(function () {
            return document.querySelector('integration-array-primitives').shadowRoot.querySelector('.splice').click();
        });

        const { value } = browser.executeAsync(function (done) {
            Promise.resolve().then(function () {
                var list = Array.prototype.slice.call(
                    document.querySelector('integration-array-primitives').shadowRoot.querySelectorAll('li')
                );

                var textList = list.map(function (li) {
                    return li.textContent;
                });

                done(textList);
            });
        });

        assert.equal(value.length, splicedLength);
        assert.deepEqual(value, splicedList);
    });
});
