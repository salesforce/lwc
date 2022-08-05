/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-from-previous-sibling';

    before(async () => {
        await browser.url(URL);
    });

    it('should apply focus to input in shadow', async () => {
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        const activeFromDocument = await browser.activeElement();
        assert.strictEqual(
            await activeFromDocument.getTagName(),
            'integration-delegates-focus-from-previous-sibling'
        );

        const activeFromShadow = await activeFromDocument.activeElementShadow();
        assert.strictEqual(await activeFromShadow.getTagName(), 'integration-child');
    });
});
