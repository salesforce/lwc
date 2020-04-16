/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-false-negative-tab-index';

    before(() => {
        browser.url(URL);
    });

    it('should not apply focus to input in shadow', () => {
        browser.keys(['Tab']);
        browser.keys(['Tab']);

        browser.waitUntil(
            () => {
                const activeFromDocument = browser.$(function () {
                    return document.activeElement;
                });

                return (
                    activeFromDocument.getTagName() ===
                    'integration-delegates-focus-false-negative-tab-index'
                );
            },
            undefined,
            'expect integration-delegates-focus-false-negative-tab-index to be focused'
        );

        browser.waitUntil(
            () => {
                const activeFromShadow = browser.$(function () {
                    return document.querySelector(
                        'integration-delegates-focus-false-negative-tab-index'
                    ).shadowRoot.activeElement;
                });

                return activeFromShadow.getTagName() === 'a';
            },
            undefined,
            'expect anchor to be focused'
        );
    });
});
