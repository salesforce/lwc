/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Delegate focus with tabindex 0, no tabbable elements, and no tabbable elements after', () => {
    const URL = '/delegates-focus-tab-index-zero-no-focusable-elements-no-after-elements';

    before(async () => {
        await browser.url(URL);
    });

    it('should correctly have no activeelement', async () => {
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        const activeElement = await browser.activeElement();
        assert.strictEqual(await activeElement.getTagName(), 'body');
    });
});
