/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Delegates focus', () => {
    const URL = 'http://localhost:4567/delegate-focus-tab-into-negative-tabindex-from-location-bar';

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
                    return document.activeElement;
                });
                return active.getTagName() === 'body';
            },
            500,
            'expect body to be focused',
        );
    });
});
