/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Tab navigation without tabindex', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should support tabindex toggling', async () => {
        const secondOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.second-outside'
        );
        await secondOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']);
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        let activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');

        // Toggle the tabindex <x-child tabindex="-1">
        const toggle = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.toggle');
        await toggle.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        await secondOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']);
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-outside');

        // Toggle the tabindex <x-child>
        await toggle.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        await secondOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']);
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');
    });
});
