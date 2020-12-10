/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-false-negative-tab-index';

    before(async () => {
        await browser.url(URL);
    });

    it('should not apply focus to input in shadow', async () => {
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        await browser.waitUntil(
            async () => {
                const activeFromDocument = await browser.activeElement();

                return (
                    (await activeFromDocument.getTagName()) ===
                    'integration-delegates-focus-false-negative-tab-index'
                );
            },
            {
                timeoutMsg:
                    'expect integration-delegates-focus-false-negative-tab-index to be focused',
            }
        );

        await browser.waitUntil(
            async () => {
                const activeFromShadow = await browser.activeElementShadowDeep();
                return (await activeFromShadow.getTagName()) === 'a';
            },
            {
                timeoutMsg: 'expect anchor to be focused',
            }
        );
    });
});
