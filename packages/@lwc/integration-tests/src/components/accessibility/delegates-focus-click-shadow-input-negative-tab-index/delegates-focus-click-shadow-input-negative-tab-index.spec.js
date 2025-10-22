/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Tabbing into custom element with delegates focus', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should apply focus to input in shadow', async () => {
        const div = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.selectable-div');
        await div.click();
        const input = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child',
            '.negative-tabindex-input'
        );
        await input.click();
        // browser.click('.selectable-div');
        // browser.click('.negative-tabindex-input');
        await browser.waitUntil(
            async () => {
                const active = await browser.activeElementShadowDeep();
                return (await active.getTagName()) === 'input';
            },
            {
                timeoutMsg: 'expected input to be focused',
            }
        );
    });
});
