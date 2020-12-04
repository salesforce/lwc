/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/issue-1031';

describe('issue #1031', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should skip child shadow when tabbing after dynamically updating parent tabindex from 0 to -1', async () => {
        const initialize = await browser.shadowDeep$('integration-issue-1031', '.initialize');
        await initialize.click(); // init tabindex to 0
        const firstOutside = await browser.shadowDeep$('integration-issue-1031', '.first-outside');
        await firstOutside.click();
        await browser.keys(['Tab']); // host element
        await browser.keys(['Tab']); // second outside input

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'second-outside');
    });

    it('should skip child shadow when shift-tabbing after dynamically updating parent tabindex from 0 to -1', async () => {
        const initialize = await browser.shadowDeep$('integration-issue-1031', '.initialize');
        await initialize.click(); // init tabindex to 0
        const secondOutside = await browser.shadowDeep$(
            'integration-issue-1031',
            '.second-outside'
        );
        await secondOutside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']); // <integration-parent>
        await browser.keys(['Shift', 'Tab', 'Shift']); // first outside input

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'first-outside');
    });
});
