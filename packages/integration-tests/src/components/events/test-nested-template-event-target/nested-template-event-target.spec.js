/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/nested-template-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function() {
        browser.execute(function() {
            var child = document
                .querySelector('integration-nested-template-event-target')
                .shadowRoot.querySelector('integration-child');
            child.dispatchFoo();
        });

        browser.waitUntil(
            () => {
                var child = browser.execute(function() {
                    return document
                        .querySelector('integration-nested-template-event-target')
                        .shadowRoot.querySelector('.evt-target-is-x-child');
                });
                return child.value !== null && child.getText() === 'Event Target Is x-child';
            },
            500,
            'Event never bubbled to parent'
        );
    });
});
