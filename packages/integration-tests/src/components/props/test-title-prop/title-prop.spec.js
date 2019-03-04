/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Title public prop', () => {
    const URL = 'http://localhost:4567/title-prop';

    before(() => {
        browser.url(URL);
    });

    it('should have rendered title property propertly', function() {
        const element = browser.element('integration-child');
        const text = element.getText();
        assert.deepEqual(text, 'Child title');
    });
});
