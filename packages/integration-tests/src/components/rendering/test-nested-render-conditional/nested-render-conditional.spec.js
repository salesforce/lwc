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
        browser.execute(function() {
            document
                .querySelector('integration-nested-render-conditional')
                .shadowRoot.querySelector('.click-me')
                .click();
        });
        browser.pause(50);
        const toggleElement = browser.execute(function() {
            return document
                .querySelector('integration-nested-render-conditional')
                .shadowRoot.querySelectorAll('.toggle');
        });
        assert.deepEqual(toggleElement.value.length, 0);
    });
});
