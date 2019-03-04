/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Issue 723: Freezing reactive proxy throws when trying to access properties', () => {
    const URL = 'http://localhost:4567/reactivity-object-freeze';

    before(() => {
        browser.url(URL);
    });

    it('should have rendered 3 items', function() {
        const li = browser.elements('li');
        assert.deepEqual(li.value.length, 3);
    });
});
