/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Delegate focus with tabindex 0, no tabbable elements, and no tabbable elements after', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should correctly have no activeelement', async () => {
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        const activeElement = await browser.activeElement();
        assert.strictEqual(await activeElement.getTagName(), 'body');
    });
});
