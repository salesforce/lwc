/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Composed focusout event', () => {
    const URL = 'http://localhost:4567/focusout-composed-true';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should be composed', function () {
        browser.click('input');
        browser.click('body');
        browser.waitUntil(() => {
            return browser.getText('.focus-out-composed') === 'Focus Out Composed';
        }, 500, 'Expect native focusout to be composed');

        browser.click('button');
        browser.waitUntil(() => {
            return browser.getText('.custom-focus-out-not-composed') === 'Custom Focus Out Not Composed';
        }, 500, 'Expect focus out to be composed');
    });
});
