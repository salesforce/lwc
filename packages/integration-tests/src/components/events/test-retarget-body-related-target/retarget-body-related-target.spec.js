/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = '/retarget-body-related-target';

    before(async () => {
        await browser.url(URL);
    });

    it('should have correct relatedTarget when body was focused', async () => {
        const body = await browser.$('body');
        await body.focus();

        await browser.keys(['Tab']);
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        const indicator = await browser.shadowDeep$(
            'integration-retarget-body-related-target',
            '.related-target-tagname'
        );
        assert.strictEqual(await indicator.getText(), 'body');
    });
});
