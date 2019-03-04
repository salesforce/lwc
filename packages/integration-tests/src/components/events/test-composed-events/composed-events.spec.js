/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Composed events', () => {
    const URL = 'http://localhost:4567/composed-events';

    before(() => {
        browser.url(URL);
    });

    it('should dispatch Event on the custom element', function() {
        browser.click('.composed-event');
        assert.ok(browser.element('.event-received-indicator'));
    });

    it('should dispatch CustomEvent on the custom element', function() {
        browser.click('.composed-custom-event');
        assert.ok(browser.element('.custom-event-received-indicator'));
    });
});
