/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Focus method on delegates focus', () => {
    const URL = 'http://localhost:4567/delegates-focus-tabindex-zero-focus-method';

    before(() => {
        browser.url(URL);
    });

    it('should focus correct element', function () {
        browser.keys(['Tab']);
        browser.execute(function () {
            document.querySelector('integration-delegates-focus-tabindex-zero-focus-method').focusInput();
        });

        browser.waitUntil(() => {
            const active = browser.execute(function () {
                return document.activeElement.shadowRoot.activeElement.shadowRoot.activeElement;
            })

            return active.getTagName().toLowerCase() === 'input';
        }, 500, 'It should delegate focus to input');
    });
});
