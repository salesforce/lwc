/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Retarget relatedTarget', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should not throw when relatedTarget is null', async () => {
        await browser.keys(['Tab']);
        await browser.waitUntil(
            async () => {
                const target = await browser.shadowDeep$(
                    `integration-${TEST_NAME}`,
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
