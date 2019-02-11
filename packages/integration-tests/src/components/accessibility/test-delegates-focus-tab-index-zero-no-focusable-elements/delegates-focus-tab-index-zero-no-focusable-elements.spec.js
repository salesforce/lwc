/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Delegate focus with tabindex 0 and no tabbable elements', () => {
    const URL = 'http://localhost:4567/delegates-focus-tab-index-zero-no-focusable-elements';

    before(() => {
        browser.url(URL);
    });

    it('should correctly skip the custom element', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);

        browser.waitUntil(() => {
            const active = browser.execute(function () {
                return document.activeElement.shadowRoot.activeElement;
            });

            return active.getText() === 'second button';
        }, 500, 'Second button should be focused');

        browser.keys(['Shift', 'Tab']);

        browser.waitUntil(() => {
            const active = browser.execute(function () {
                return document.activeElement.shadowRoot.activeElement;
            });

            return active.getText() === 'first button';
        }, 500, 'First button should be focused');
    });
});
