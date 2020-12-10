/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-slot';

    before(async () => {
        await browser.url(URL);
    });

    it('should apply focus to input in shadow', async () => {
        await browser.keys(['Tab']);
        const activeFromDocument = await browser.activeElement();
        assert.strictEqual(
            await activeFromDocument.getTagName(),
            'integration-delegates-focus-slot'
        );

        const activeFromShadow = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeFromShadow.getTagName(), 'input');
    });

    it('should apply focus to body after exiting in shadow', async () => {
        await browser.keys(['Tab']);
        const activeFromDocument = await browser.activeElement();

        const tabName = await activeFromDocument.getTagName();
        const isTopElement = tabName === 'body' || tabName === 'html';
        assert.ok(isTopElement);

        const activeFromShadow = await browser.activeElementShadowDeep();
        assert.strictEqual(activeFromShadow.value, undefined);
    });

    it('should apply focus to input in shadow when tabbing backwards', async () => {
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const activeFromDocument = await browser.activeElement();
        assert.strictEqual(
            await activeFromDocument.getTagName(),
            'integration-delegates-focus-slot'
        );

        const activeFromShadow = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeFromShadow.getTagName(), 'input');
    });
});
