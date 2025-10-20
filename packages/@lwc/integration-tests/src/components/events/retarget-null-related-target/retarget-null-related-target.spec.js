/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Retarget relatedTarget', () => {
    const URL = '/retarget-null-related-target';

    before(async () => {
        await browser.url(URL);
    });

    it('should not throw when relatedTarget is null', async () => {
        await browser.keys(['Tab']);
        await browser.waitUntil(
            async () => {
                const target = await browser.shadowDeep$(
                    'integration-retarget-null-related-target',
                    '.related-target-tabname'
                );
                return (await target.getText()) === 'Related target is null';
            },
            {
                timeoutMsg: 'Expected correct message',
            }
        );
    });
});
