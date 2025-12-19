/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Tab navigation when component passes tabindex attribute to an internal element', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should focus on internal element when tabbing forward from a sibling element', async () => {
        const secondOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.second-outside'
        );
        await secondOutside.click();
        await browser.keys(['Tab']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');
    });

    it('should focus on internal element when tabbing backwards from a sibling element', async () => {
        const thirdOutside = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.third-outside'
        );
        await thirdOutside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-inside');
    });
});
