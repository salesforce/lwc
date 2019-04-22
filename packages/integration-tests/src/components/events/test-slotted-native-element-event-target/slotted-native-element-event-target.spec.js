/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/slotted-native-element-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function() {
        browser.execute(function() {
            document
                .querySelector('integration-slotted-native-element-event-target')
                .shadowRoot.querySelector('p')
                .click();
        });
        browser.waitUntil(
            () => {
                var child = browser.execute(function() {
                    return document
                        .querySelector('integration-slotted-native-element-event-target')
                        .shadowRoot.querySelector('integration-child')
                        .shadowRoot.querySelector('.correct-event-target');
                });
                return child.value !== null && child.getText() === 'Event target is correct';
            },
            500,
            "did not receive expected event target in slot element's parent handler"
        );
    });
});
