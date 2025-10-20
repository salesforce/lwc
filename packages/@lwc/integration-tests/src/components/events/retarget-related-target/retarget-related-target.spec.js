/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/retarget-related-target';

describe('Retarget relatedTarget', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should retarget relatedTarget for MouseEvent', async () => {
        const first = await browser.shadowDeep$(
            'integration-retarget-related-target',
            'integration-child.first',
            'input'
        );
        const second = await browser.shadowDeep$(
            'integration-retarget-related-target',
            'integration-child.second',
            'input'
        );
        const indicator = await browser.shadowDeep$(
            'integration-retarget-related-target',
            '.related-target-class-name'
        );

        await first.moveTo();
        await second.moveTo();
        await first.moveTo();

        assert.strictEqual(await indicator.getText(), 'undefined, first, second');
    });
});
