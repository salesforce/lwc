/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Event dispatch piercing', () => {
    const URL = 'http://localhost:4567/pierce-dispatch-event';

    before(() => {
        browser.url(URL);
    });

    it.skip('should have pierced and dispatched a non-custom even correctly', function() {
        const element = browser.element('.event-count');
        assert.strictEqual(element.getText(), 'Event Count: 1');
    });
});
