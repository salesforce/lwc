/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('shadow root element from point should return correct element', () => {
    const URL = '/element-from-point/';

    before(() => {
        browser.url(URL);
    });

    it('should return correct shadow elements', function () {
        browser.execute(function () {
            document
                .querySelector('integration-element-from-point')
                .shadowRoot.querySelector('.shadow-element-from-point')
                .click();
        });
        browser.waitUntil(() => {
            const indicator = browser.$(function () {
                return document
                    .querySelector('integration-element-from-point')
                    .shadowRoot.querySelector('.correct-shadow-element-indicator');
            });
            return indicator.getText() === 'Correct shadow element selected';
        });
    });

    it('should return correct document elements', function () {
        browser.execute(function () {
            document
                .querySelector('integration-element-from-point')
                .shadowRoot.querySelector('.document-from-point')
                .click();
        });
        browser.waitUntil(() => {
            const indicator = browser.$(function () {
                return document
                    .querySelector('integration-element-from-point')
                    .shadowRoot.querySelector('.correct-document-element-indicator');
            });
            return indicator.getText() === 'Correct document element selected';
        });
    });
});
