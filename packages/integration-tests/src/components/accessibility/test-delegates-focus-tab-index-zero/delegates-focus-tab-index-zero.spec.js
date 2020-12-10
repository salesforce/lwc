/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Delegate focus with tabindex 0', () => {
    const URL = '/delegates-focus-tab-index-zero/';

    before(async () => {
        await browser.url(URL);
    });

    it('should correctly focus on the input, not custom element', async () => {
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        await browser.waitUntil(
            async () => {
                const active = await browser.activeElementShadowDeep();
                return (await active.getTagName()) === 'input';
            },
            {
                timeoutMsg: 'Input should be focused',
            }
        );
    });

    it('should correctly focus on the previous element when shift tabbing', async () => {
        await browser.keys(['Tab']);

        await browser.waitUntil(
            async () => {
                const active = await browser.activeElementShadowDeep();
                return (await active.getText()) === 'second button';
            },
            {
                timeoutMsg: 'Second button should be focused',
            }
        );

        await browser.keys(['Shift', 'Tab', 'Shift']);

        await browser.waitUntil(
            async () => {
                const active = await browser.activeElementShadowDeep();
                return (await active.getTagName()) === 'input';
            },
            {
                timeoutMsg: 'Input should be focused',
            }
        );

        await browser.keys(['Shift', 'Tab', 'Shift']);

        await browser.waitUntil(
            async () => {
                const active = await browser.activeElementShadowDeep();
                return (await active.getText()) === 'first button';
            },
            {
                timeoutMsg: 'First button should be focused',
            }
        );
    });
});
