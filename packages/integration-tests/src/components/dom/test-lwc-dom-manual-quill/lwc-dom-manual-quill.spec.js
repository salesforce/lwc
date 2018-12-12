/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('LWC Dom remove element sync', () => {
    const URL = 'http://localhost:4567/lwc-dom-manual-quill';

    before(() => {
        browser.url(URL);
    });

    it('should not throw an error', () => {
        const button = browser.execute(function () {
            return document.querySelector('integration-lwc-dom-manual-quill').shadowRoot.querySelector('button');
        });
        const errorMessageEl = browser.execute(function () {
            return document.querySelector('integration-lwc-dom-manual-quill').shadowRoot.querySelector('.error');
        });

        button.click();

        browser.waitUntil(() => {
            return errorMessageEl.getText() === 'No error';
        });
    });
});
