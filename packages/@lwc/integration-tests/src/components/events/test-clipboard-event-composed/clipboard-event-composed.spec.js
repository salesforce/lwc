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
    return browser.keys(['Control', 'Insert', 'Control']);
}

function paste() {
    return browser.keys(['Shift', 'Insert', 'Shift']);
}

describe('clipboard-event-composed polyfill', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('copy event should be composed', async () => {
        await browser.$(function () {
            window.getSelection().selectAllChildren(document.body);
        });

        await copy();

        const didHandleCopy = await browser.execute(() => {
            var container = document.querySelector('integration-clipboard-event-composed');
            return container.didHandleCopy();
        });
        assert.strictEqual(didHandleCopy, true);
    });

    it('paste event should be composed', async () => {
        await browser.$(function () {
            window.getSelection().selectAllChildren(document.body);
        });

        await copy();
        await paste();

        const didHandlePaste = await browser.execute(() => {
            var container = document.querySelector('integration-clipboard-event-composed');
            return container.didHandlePaste();
        });
        assert.strictEqual(didHandlePaste, true);
    });
});
