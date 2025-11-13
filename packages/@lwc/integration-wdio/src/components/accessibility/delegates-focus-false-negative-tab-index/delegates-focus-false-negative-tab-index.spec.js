/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Tabbing into custom element with delegates focus', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should not apply focus to input in shadow', async () => {
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        await browser.waitUntil(
            async () => {
                const activeFromDocument = await browser.activeElement();

                return (await activeFromDocument.getTagName()) === `integration-${TEST_NAME}`;
            },
            {
                timeoutMsg: `expect integration-${TEST_NAME} to be focused`,
            }
        );

        await browser.waitUntil(
            async () => {
                const activeFromShadow = await browser.activeElementShadowDeep();
                return (await activeFromShadow.getTagName()) === 'a';
            },
            {
                timeoutMsg: 'expect anchor to be focused',
            }
        );
    });
});
