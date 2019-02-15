/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Issue 791: [IE11] Radio Buttons are not rendering with correct value', () => {
    const URL = 'http://localhost:4567/radio-group-value';

    before(() => {
        browser.url(URL);
    });

    it('should get correct value from radio button', function () {
        const radio = browser.element('.radiobtn');
        radio.click();
        const text = browser.element('.value');
        assert.equal(text.getText(), 'secondbutton');
    });
});
