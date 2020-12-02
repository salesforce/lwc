/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('shadow root element from point should return correct element', () => {
    const URL = '/element-from-point/';

    before(async () => {
        await browser.url(URL);
    });

    it('should return correct shadow elements', async () => {
        await browser.execute(function () {
            document
                .querySelector('integration-element-from-point')
                .shadowRoot.querySelector('.shadow-element-from-point')
                .click();
        });
        await browser.waitUntil(async () => {
            const indicator = await browser.$(function () {
                return document
                    .querySelector('integration-element-from-point')
                    .shadowRoot.querySelector('.correct-shadow-element-indicator');
            });
            return (await indicator.getText()) === 'Correct shadow element selected';
        });
    });

    it('should return correct document elements', async () => {
        await browser.execute(function () {
            document
                .querySelector('integration-element-from-point')
                .shadowRoot.querySelector('.document-from-point')
                .click();
        });
        await browser.waitUntil(async () => {
            const indicator = await browser.$(function () {
                return document
                    .querySelector('integration-element-from-point')
                    .shadowRoot.querySelector('.correct-document-element-indicator');
            });
            return (await indicator.getText()) === 'Correct document element selected';
        });
    });
});
