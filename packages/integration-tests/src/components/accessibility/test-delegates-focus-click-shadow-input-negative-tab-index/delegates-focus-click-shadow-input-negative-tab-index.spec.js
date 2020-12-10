/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-click-shadow-input-negative-tab-index';

    before(async () => {
        await browser.url(URL);
    });

    it('should apply focus to input in shadow', async () => {
        const div = await browser.shadowDeep$(
            'integration-delegates-focus-click-shadow-input-negative-tab-index',
            '.selectable-div'
        );
        await div.click();
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-click-shadow-input-negative-tab-index',
            'integration-child',
            '.negative-tab-index-input'
        );
        await input.click();
        // browser.click('.selectable-div');
        // browser.click('.negative-tab-index-input');
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
