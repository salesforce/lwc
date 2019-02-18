/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Delegates focus', () => {
    const URL = 'http://localhost:4567/delegate-focus-tab-into-input-in-negative-tabindex';

    before(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function() {
        browser.keys(['Tab']); // tab into first anchor
        browser.keys(['Tab']); // tab into second anchor
        browser.keys(['Tab']); // tab over integration-child
        browser.waitUntil(
            () => {
                const active = browser.execute(function() {
                    return document.querySelector(
                        'integration-delegate-focus-tab-into-input-in-negative-tabindex',
                    ).shadowRoot.activeElement;
                });
                return active.getText() === 'Anchor 3';
            },
            500,
            'Expect Anchor 3 to be focused',
        );
    });
});
