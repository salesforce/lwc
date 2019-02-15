/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('@api prop mutation errors', () => {
    const URL = 'http://localhost:4567/mutate-api-error';

    before(() => {
        browser.url(URL);
    });

    it('should throw error when trying to modify @api value in child', () => {
        const clickEl = browser.element('.click');
        clickEl.click();
        const errorEl = browser.element('.error-message');
        assert(errorEl.getText() !== '');
    });
});
