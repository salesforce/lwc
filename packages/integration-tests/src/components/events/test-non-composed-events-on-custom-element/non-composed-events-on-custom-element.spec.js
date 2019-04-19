/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Non-composed events', () => {
    const URL = 'http://localhost:4567/non-composed-events-on-custom-element';

    before(() => {
        browser.url(URL);
    });

    it('should dispatch Event on the custom element', function() {
        browser.execute(function() {
            document
                .querySelector('integration-non-composed-events-on-custom-element')
                .shadowRoot.querySelector('integration-child')
                .click();
        });
        const indicator = browser.execute(function() {
            return document
                .querySelector('integration-non-composed-events-on-custom-element')
                .shadowRoot.querySelector('.event-received-indicator');
        });
        assert.ok(indicator);
    });

    it('should dispatch CustomEvent on the custom element', function() {
        browser.execute(function() {
            document
                .querySelector('integration-non-composed-events-on-custom-element')
                .shadowRoot.querySelector('integration-child')
                .click();
        });
        const indicator = browser.execute(function() {
            return document
                .querySelector('integration-non-composed-events-on-custom-element')
                .shadowRoot.querySelector('.custom-event-received-indicator');
        });
        assert.ok(indicator);
    });
});
