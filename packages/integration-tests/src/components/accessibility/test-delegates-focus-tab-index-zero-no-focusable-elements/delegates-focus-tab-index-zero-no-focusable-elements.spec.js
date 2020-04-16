/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Delegate focus with tabindex 0 and no tabbable elements', () => {
    const URL = '/delegates-focus-tab-index-zero-no-focusable-elements';

    before(() => {
        browser.url(URL);
    });

    it('should correctly skip the custom element', function () {
        browser.keys(['Tab']);
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
                    return document.activeElement.shadowRoot.activeElement;
                });

                return active.getText() === 'first button';
            },
            undefined,
            'First button should be focused'
        );
    });
});
