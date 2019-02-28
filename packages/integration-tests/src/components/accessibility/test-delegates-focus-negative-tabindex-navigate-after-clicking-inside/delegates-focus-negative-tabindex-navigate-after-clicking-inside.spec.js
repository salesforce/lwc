/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/delegates-focus-negative-tabindex-navigate-after-clicking-inside';

describe('When delegatesFocus=true and tabindex=-1, and navigating with the keyboard', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it.skip('should skip forwards', function () {
        browser.click('.second-outside');
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            return document.activeElement // container
                .shadowRoot.activeElement // input
                .className;
        }).value;

        assert.equal(className, 'third-outside');
    });

    it.skip('should skip backwards', function () {
        browser.click('.third-outside');
        browser.keys(['Shift', 'Tab']);

        var className = browser.execute(function () {
            return document.activeElement // container
                .shadowRoot.activeElement // input
                .className;
        }).value;

        assert.equal(className, 'second-outside');
    });

    it.skip('should navigate forwards inside shadow once shadow is clicked into', function () {
        browser.click('.first-inside');
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            return document.activeElement // container
                .shadowRoot.activeElement // integration-child
                .shadowRoot.activeElement // input
                .className;
        }).value;

        assert.equal(className, 'second-inside');
    });

    it.skip('should navigate backwards inside shadow once shadow is clicked into', function () {
        browser.click('.third-inside');
        browser.keys(['Shift', 'Tab']);

        var className = browser.execute(function () {
            return document.activeElement // container
                .shadowRoot.activeElement // integration-child
                .shadowRoot.activeElement // input
                .className;
        }).value;

        assert.equal(className, 'second-inside');
    });

    it('should continue skipping elements even after shadow is clicked into', function () {
        browser.click('.second-inside');
        browser.click('.second-outside');
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            return document.activeElement // container
                .shadowRoot.activeElement // input
                .className;
        }).value;

        assert.equal(className, 'third-outside');
    });
});
