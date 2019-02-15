/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

// This test is now disable waiting for a proper fix to event.preventDefault()
describe.skip('Composed events', () => {
    const URL = 'http://localhost:4567/default-prevented';

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('integration-child');
        element.click();
        const defaultPreventedIndicator = browser.element('.default-prevented-indicator');
        assert.deepEqual(defaultPreventedIndicator.getText(), 'Default Prevented');
    });
});
