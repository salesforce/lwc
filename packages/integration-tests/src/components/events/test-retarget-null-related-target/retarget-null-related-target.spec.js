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
        await browser.waitUntil(async () => {
            const text = await browser.execute(function () {
                return document
                    .querySelector('integration-retarget-null-related-target')
                    .shadowRoot.querySelector('.related-target-tabname').textContent;
            });

            return text === 'Related target is null';
        });
    });
});
