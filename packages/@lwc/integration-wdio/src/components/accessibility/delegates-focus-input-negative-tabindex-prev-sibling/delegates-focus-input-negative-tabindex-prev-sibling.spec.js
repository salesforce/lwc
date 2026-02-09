/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');

// The bug: Cannot click into the first child of a shadow root when the active element is
// the previous sibling to the custom element

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Delegates focus', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should focus the input when clicked', async () => {
        await browser.keys(['Tab']); // focus first anchor
        await browser.keys(['Tab']); // focus second anchor
        const input = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child',
            'input'
        );

        await input.click();

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'input');
    });
});
