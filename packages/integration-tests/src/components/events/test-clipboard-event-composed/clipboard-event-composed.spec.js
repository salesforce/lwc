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
function cut() {
    browser.keys(['Control', 'Delete', 'Control']);
}
function paste() {
    browser.keys(['Shift', 'Insert', 'Shift']);
}

describe('clipboard-event-composed', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('copy event should be composed', () => {
        const input = browser.$(function() {
            var container = document.querySelector('integration-clipboard-event-composed');
            var child = container.shadowRoot.querySelector('integration-child');
            return child.shadowRoot.querySelector('input');
        });
        input.doubleClick();

        copy();

        const didHandleCopy = browser.execute(() => {
            var container = document.querySelector('integration-clipboard-event-composed');
            return container.didHandleCopy();
        });

        assert.strictEqual(didHandleCopy, true);
    });

    // The cut() function is not working as expected.
    it.skip('cut event should be composed', () => {
        const input = browser.$(function() {
            var container = document.querySelector('integration-clipboard-event-composed');
            var child = container.shadowRoot.querySelector('integration-child');
            return child.shadowRoot.querySelector('input');
        });
        input.doubleClick();

        cut();

        const didHandleCut = browser.execute(() => {
            var container = document.querySelector('integration-clipboard-event-composed');
            return container.didHandleCut();
        });
        assert.strictEqual(didHandleCut, true);
    });

    it('paste event should be composed', () => {
        const input = browser.$(function() {
            var container = document.querySelector('integration-clipboard-event-composed');
            var child = container.shadowRoot.querySelector('integration-child');
            return child.shadowRoot.querySelector('input');
        });
        input.doubleClick();

        copy();
        paste();

        const didHandlePaste = browser.execute(() => {
            var container = document.querySelector('integration-clipboard-event-composed');
            return container.didHandlePaste();
        });
        assert.strictEqual(didHandlePaste, true);
    });
});
