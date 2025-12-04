/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Tab navigation when tabindex -1 after inside click', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should continue skipping elements (forward)', async () => {
        const secondInside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await secondInside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        const secondOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.second-outside'
        );
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await secondOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-outside');
    });

    it('should continue skipping elements after navigating out (forward)', async () => {
        const secondInside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await secondInside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']); // third inside
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']); // third outside
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-outside');
    });

    it('should continue skipping elements (backward)', async () => {
        const secondInside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await secondInside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
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

    it('should continue skipping elements after navigating out (backwards)', async () => {
        const secondInside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await secondInside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Shift', 'Tab', 'Shift']); // first inside
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Shift', 'Tab', 'Shift']); // second outside
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'second-outside');
    });
});
