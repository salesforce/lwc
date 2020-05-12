/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/clipboard-event-composed';

// https://stackoverflow.com/questions/11750447/performing-a-copy-and-paste-with-selenium-2/41046276#41046276
function copy() {
    browser.keys(['Control', 'Insert', 'Control']);
}

function paste() {
    browser.keys(['Shift', 'Insert', 'Shift']);
}

describe('clipboard-event-composed polyfill', () => {
    before(function () {
        // This test suite relies on the Selection API which is not supported in ie11
        if (browser.capabilities.browserName === 'internet explorer') {
            this.skip();
        }
    });

    beforeEach(() => {
        browser.url(URL);
    });

    it('copy event should be composed', () => {
        browser.$(function () {
            window.getSelection().selectAllChildren(document.body);
        });

        copy();

        const didHandleCopy = browser.execute(() => {
            var container = document.querySelector('integration-clipboard-event-composed');
            return container.didHandleCopy();
        });

        assert.strictEqual(didHandleCopy, true);
    });

    it('paste event should be composed', () => {
        browser.$(function () {
            window.getSelection().selectAllChildren(document.body);
        });

        copy();
        paste();

        const didHandlePaste = browser.execute(() => {
            var container = document.querySelector('integration-clipboard-event-composed');
            return container.didHandlePaste();
        });
        assert.strictEqual(didHandlePaste, true);
    });
});
