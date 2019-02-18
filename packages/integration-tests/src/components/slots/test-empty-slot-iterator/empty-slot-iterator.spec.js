/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Slots with empty iterators should render', () => {
    const URL = 'http://localhost:4567/empty-slot-iterator';

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function() {
        const element = browser.element('integration-child');
        assert.equal(element.getText(), 'Rendered ok');
    });
});
