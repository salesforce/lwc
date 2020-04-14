/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Composed focusout event', () => {
    const URL = '/focusout-composed-true';

    before(() => {
        browser.url(URL);
    });

    it('standard event should be composed', function () {
        const input = browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('input');
        });

        input.click();
        $('body').click();

        const focusInComposed = browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('.focus-out-composed');
        });
        assert.deepEqual(focusInComposed.getText(), 'Focus Out Composed');
    });
    it('custom event shoud not be composed', () => {
        const button = browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('button');
        });
        button.click();
        const customFocusInNotComposed = browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('.custom-focus-out-not-composed');
        });
        assert.deepEqual(customFocusInNotComposed.getText(), 'Custom Focus Out Not Composed');
    });
});
