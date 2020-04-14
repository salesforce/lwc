/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Delegate focus with tabindex 0', () => {
    const URL = '/delegates-focus-tab-index-zero/';

    before(() => {
        browser.url(URL);
    });

    it('should correctly focus on the input, not custom element', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);

        browser.waitUntil(
            () => {
                const active = browser.$(function () {
                    return document.activeElement.shadowRoot.activeElement.shadowRoot.activeElement;
                });

                return active.getTagName().toLowerCase() === 'input';
            },
            undefined,
            'Input should be focused'
        );
    });

    it('should correctly focus on the previous element when shift tabbing', function () {
        browser.keys(['Tab']);

        browser.waitUntil(
            () => {
                const active = browser.$(function () {
                    return document.activeElement.shadowRoot.activeElement;
                });

                return active.getText() === 'second button';
            },
            undefined,
            'Second button should be focused'
        );

        browser.keys(['Shift', 'Tab', 'Shift']);

        browser.waitUntil(
            () => {
                const active = browser.$(function () {
                    return document.activeElement.shadowRoot.activeElement.shadowRoot.activeElement;
                });

                return active.getTagName().toLowerCase() === 'input';
            },
            undefined,
            'Input should be focused'
        );

        browser.keys(['Shift', 'Tab', 'Shift']);

        browser.waitUntil(
            () => {
                const active = browser.$(function () {
                    return document.activeElement.shadowRoot.activeElement;
                });
                return active.getText() === 'first button';
            },
            undefined,
            'First button should be focused'
        );
    });
});
