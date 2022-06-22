/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-negative-tabindex-focusin-handler';

    before(async () => {
        await browser.url(URL);
    });

    it('should apply focus to input in shadow', async () => {
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-negative-tabindex-focusin-handler',
            'integration-child',
            '.focusable-input'
        );
        await input.click();

        await browser.waitUntil(
            async () => {
                const div = await browser.shadowDeep$(
                    'integration-delegates-focus-negative-tabindex-focusin-handler',
                    '.focus-in-called'
                );
                return (await div.getText()) === 'Focus in called';
            },
            {
                timeoutMsg: 'expected focusin to have been triggered',
            }
        );
    });
});
