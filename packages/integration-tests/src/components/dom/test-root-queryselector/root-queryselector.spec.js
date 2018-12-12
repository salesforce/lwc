/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Testing component: test-root-queryselector', () => {
    const URL = 'http://localhost:4567/root-queryselector';

    before(() => {
        browser.url(URL);
    });

    it('should not render an error', function () {
        const elem = browser.element('integration-root-queryselector');
        const noerror = browser.elements('.no-error');
        const error = browser.elements('.error');
        assert.equal(noerror.value.length, 1);
        assert.equal(error.value.length, 0);
    });
});
