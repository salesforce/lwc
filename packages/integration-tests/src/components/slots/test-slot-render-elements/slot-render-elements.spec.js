/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe("Issue 627: Named slot doesn't work properly.", () => {
    const URL = 'http://localhost:4567/slot-render-elements';

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function() {
        const element = browser.element('integration-child');
        assert.equal(element.getText(), 'Content rendered in slot');
        assert.ok(browser.element('.content-in-slot'));
    });
});
