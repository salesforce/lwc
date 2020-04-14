/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = '/slotted-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function () {
        const select = browser.$(function () {
            return document
                .querySelector('integration-slotted-event-target')
                .shadowRoot.querySelector('select');
        });
        select.selectByVisibleText('Second');

        const element = browser.$(function () {
            return document
                .querySelector('integration-slotted-event-target')
                .shadowRoot.querySelector('.target-is-select');
        });
        assert.strictEqual(element.getText(), 'Event Target is select element');
    });
});
