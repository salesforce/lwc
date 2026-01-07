/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('focus delegation when clicking on form element label', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should apply focus to element associated with label when relatedTarget is null', async () => {
        const label = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-input',
            'label'
        );
        await label.click();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'internal');
    });

    it('should apply focus to element associated with label when relatedTarget is non-null', async () => {
        const headInput = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.head');
        // Focus on input so that relatedTarget will be non-null
        await headInput.click();

        const label = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-input',
            'label'
        );
        await label.click();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'internal');
    });
});
