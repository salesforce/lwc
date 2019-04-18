/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/slotted-custom-element-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function() {
        browser.execute(function() {
            document
                .querySelector('integration-slotted-custom-element-event-target')
                .shadowRoot.querySelector('integration-child')
                .click();
        });
        browser.waitUntil(
            () => {
                var child = browser.execute(function() {
                    return document
                        .querySelector('integration-slotted-custom-element-event-target')
                        .shadowRoot.querySelector('integration-parent')
                        .shadowRoot.querySelector('.correct-event-target');
                });
                return child !== null && child.getText() === 'Event target is correct';
            },
            500,
            'did not receive expected event target in parent'
        );
    });
});
