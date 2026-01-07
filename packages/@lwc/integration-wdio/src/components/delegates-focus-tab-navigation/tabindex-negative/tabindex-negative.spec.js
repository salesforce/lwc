/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Tab navigation when tabindex -1', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should skip shadow (forward)', async () => {
        const secondOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.second-outside'
        );
        await secondOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']);
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-outside');
    });

    it('should skip shadow (backward)', async () => {
        const thirdOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.third-outside'
        );
        await thirdOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Shift', 'Tab', 'Shift']);
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'second-outside');
    });
});
