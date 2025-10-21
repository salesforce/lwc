/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('issue #1031', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should skip child shadow when tabbing after dynamically updating parent tabindex from 0 to -1', async () => {
        const initialize = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.initialize');
        await initialize.click(); // init tabindex to 0
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const firstOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.first-outside'
        );
        await firstOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        await browser.keys(['Tab']); // host element
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']); // second outside input
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'second-outside');
    });

    it('should skip child shadow when shift-tabbing after dynamically updating parent tabindex from 0 to -1', async () => {
        const initialize = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.initialize');
        await initialize.click(); // init tabindex to 0
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const secondOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.second-outside'
        );
        await secondOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        await browser.keys(['Shift', 'Tab', 'Shift']); // <integration-parent>
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Shift', 'Tab', 'Shift']); // first outside input
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-outside');
    });
});
