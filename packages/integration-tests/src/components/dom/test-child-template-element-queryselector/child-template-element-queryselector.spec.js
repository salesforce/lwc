/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('event target query selector', () => {
    const URL = 'http://localhost:4567/child-template-element-queryselector/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should return correct elements', function () {
        browser.execute(function () {
            document.querySelector('integration-child-template-element-queryselector').click();
        });
        const shadowDiv = browser.element('.shadow-div');
        assert.equal(shadowDiv.getAttribute('data-selected'), null);
        const lightDiv = browser.element('.light-div');
        assert.equal(lightDiv.getAttribute('data-selected'), 'true');
    });
});
