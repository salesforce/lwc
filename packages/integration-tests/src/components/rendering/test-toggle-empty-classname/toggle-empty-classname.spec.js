/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Toggling to empty classname', () => {
    const URL = 'http://localhost:4567/toggle-empty-classname';

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('integration-toggle-empty-classname');
        element.click();

        const className = browser.getAttribute('integration-toggle-empty-classname div', 'class');
        assert.deepEqual(className, '');
    });
});
