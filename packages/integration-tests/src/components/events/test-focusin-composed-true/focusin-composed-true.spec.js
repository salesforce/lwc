/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Composed focusin event', () => {
    const URL = 'http://localhost:4567/focusin-composed-true';

    before(() => {
        browser.url(URL);
    });

    it('should be composed', function() {
        browser.click('input');
        browser.click('body');
        browser.pause(50);
        assert.deepEqual(browser.getText('.focus-in-composed'), 'Focus In Composed');

        browser.click('button');
        assert.deepEqual(
            browser.getText('.custom-focus-in-not-composed'),
            'Custom Focus In Not Composed',
        );
    });
});
