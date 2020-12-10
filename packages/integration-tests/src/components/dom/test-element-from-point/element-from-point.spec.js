/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('shadow root element from point should return correct element', () => {
    const URL = '/element-from-point/';

    before(async () => {
        await browser.url(URL);
    });

    it('should return correct shadow elements', async () => {
        const target = await browser.shadowDeep$(
            'integration-element-from-point',
            '.shadow-element-from-point'
        );
        await target.click();

        await browser.waitUntil(
            async () => {
                const indicator = await browser.shadowDeep$(
                    'integration-element-from-point',
                    '.correct-shadow-element-indicator'
                );
                return (await indicator.getText()) === 'Correct shadow element selected';
            },
            {
                timeoutMsg: 'Expected correct text to be present',
            }
        );
    });

    it('should return correct document elements', async () => {
        const target = await browser.shadowDeep$(
            'integration-element-from-point',
            '.document-from-point'
        );
        await target.click();

        await browser.waitUntil(
            async () => {
                const indicator = await browser.shadowDeep$(
                    'integration-element-from-point',
                    '.correct-document-element-indicator'
                );
                return (await indicator.getText()) === 'Correct document element selected';
            },
            {
                timeoutMsg: 'Expected correct text to be present',
            }
        );
    });
});
