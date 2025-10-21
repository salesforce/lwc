/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Retarget relatedTarget', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should retarget relatedTarget for MouseEvent', async () => {
        const first = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child.first',
            'input'
        );
        const second = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child.second',
            'input'
        );
        const indicator = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.related-target-class-name'
        );

        await first.moveTo();
        await second.moveTo();
        await first.moveTo();

        assert.strictEqual(await indicator.getText(), 'undefined, first, second');
    });
});
