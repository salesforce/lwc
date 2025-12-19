/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Retarget relatedTarget', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should have correct relatedTarget when body was focused', async () => {
        const body = await browser.$('body');
        await body.focus();

        await browser.keys(['Tab']);
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        const indicator = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            '.related-target-tagname'
        );
        assert.strictEqual(await indicator.getText(), 'body');
    });
});
