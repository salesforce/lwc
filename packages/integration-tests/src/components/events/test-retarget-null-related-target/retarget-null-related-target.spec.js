/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Retarget relatedTarget', () => {
    const URL = '/retarget-null-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should not throw when relatedTarget is null', () => {
        browser.keys(['Tab']);
        browser.waitUntil(() => {
            const text = browser.execute(function () {
                return document
                    .querySelector('integration-retarget-null-related-target')
                    .shadowRoot.querySelector('.related-target-tabname').textContent;
            });

            return text === 'Related target is null';
        });
    });
});
