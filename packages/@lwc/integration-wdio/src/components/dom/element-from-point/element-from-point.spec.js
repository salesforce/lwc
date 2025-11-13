/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('shadow root element from point should return correct element', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should return correct shadow elements', async () => {
        const target = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            `.shadow-${TEST_NAME}`
        );
        await target.click();

        await browser.waitUntil(
            async () => {
                const indicator = await browser.shadowDeep$(
                    `integration-${TEST_NAME}`,
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
            `integration-${TEST_NAME}`,
            '.document-from-point'
        );
        await target.click();

        await browser.waitUntil(
            async () => {
                const indicator = await browser.shadowDeep$(
                    `integration-${TEST_NAME}`,
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
