/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Event Target on window event listener', () => {
    const URL = 'http://localhost:4567/window-event-listener/';

    before(() => {
        browser.url(URL);
    });

    // The composed-event-click-polyfill doesn't work when native Shadow DOM is enabled on Safari 12.0.0 (it has been fixed
    // with Safari 12.0.1). The polyfill only patches the event javascript wrapper and doesn't have any effect on how Webkit
    // make the event bubbles.
    // TODO: #XXX - Remove this test once Sauce Labs supports Safari version >= 12.0.1
    // TODO: #XXX - Enable the corresponding integration-karma test
    it('should return correct target', function() {
        browser.execute(function() {
            document
                .querySelector('integration-window-event-listener')
                .shadowRoot.querySelector('button')
                .click();
        });
        const indicator = browser.execute(function() {
            return document
                .querySelector('integration-window-event-listener')
                .shadowRoot.querySelector('.window-event-target-tagname');
        });
        assert.deepEqual(indicator.getText(), 'integration-window-event-listener');
    });
});
