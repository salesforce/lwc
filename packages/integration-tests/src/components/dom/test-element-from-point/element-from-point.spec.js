/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('shadow root element from point should return correct element', () => {
    const URL = 'http://localhost:4567/element-from-point/';

    beforeEach(() => {
        browser.url(URL);
    });

    it('should return correct shadow elements', function() {
        browser.execute(function() {
            document
                .querySelector('integration-element-from-point')
                .shadowRoot.querySelector('.shadow-element-from-point')
                .click();
        });
        browser.waitUntil(
            () => {
                const indicator = browser.execute(function() {
                    return document
                        .querySelector('integration-element-from-point')
                        .shadowRoot.querySelector('.correct-shadow-element-indicator');
                });
                return (
                    indicator.value !== null &&
                    indicator.getText() === 'Correct shadow element selected'
                );
            },
            1000,
            'expected .correct-shadow-element-indicator selector to return expected node'
        );
    });

    it('should return correct document elements', function() {
        browser.execute(function() {
            document
                .querySelector('integration-element-from-point')
                .shadowRoot.querySelector('.document-from-point')
                .click();
        });
        browser.waitUntil(
            () => {
                const indicator = browser.execute(function() {
                    return document
                        .querySelector('integration-element-from-point')
                        .shadowRoot.querySelector('.correct-document-element-indicator');
                });
                return (
                    indicator.value !== null &&
                    indicator.getText() === 'Correct document element selected'
                );
            },
            1000,
            'expected .correct-document-element-indicator selector to return expected node'
        );
    });
});
