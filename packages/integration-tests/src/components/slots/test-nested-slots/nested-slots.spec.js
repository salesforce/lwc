/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Slots with empty iterators should render', () => {
    const URL = 'http://localhost:4567/nested-slots';

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function () {
        const result = browser.execute(function () {
            return document.querySelector('integration-nested-slots').getRegisteredTabs();
        });
        assert.ok(result);
        assert.equal(result.value, 2);
    });
});
