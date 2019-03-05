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

    it('should return correct target', function() {
        browser.click('button');
        assert.deepEqual(
            browser.getText('.window-event-target-tagname'),
            'integration-window-event-listener'
        );
    });
});
