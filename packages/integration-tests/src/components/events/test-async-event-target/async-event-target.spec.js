/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Async event target', () => {
    const URL = 'http://localhost:4567/async-event-target';

    before(() => {
        browser.url(URL);
    });

    it('should be root node', function() {
        browser.click('integration-child');
        assert.deepEqual(browser.getText('.correct-sync-target'), 'Correct sync target');
        browser.waitUntil(
            () => {
                return browser.getText('.correct-async-target') === 'Correct async target';
            },
            1000,
            'Expected async target to be <async-event-target>'
        );
    });
});
