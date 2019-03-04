/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Nested conditional render', () => {
    const URL = 'http://localhost:4567/nested-render-conditional';

    before(() => {
        browser.url(URL);
    });

    it('should toggle element with nested conditional', function() {
        const clickElement = browser.element('.click-me');
        clickElement.click();
        const toggleElement = browser.elements('.toggle');
        assert.deepEqual(toggleElement.value.length, 0);
    });
});
