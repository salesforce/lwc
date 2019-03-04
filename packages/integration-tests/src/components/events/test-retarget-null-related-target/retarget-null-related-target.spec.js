/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

// Really hard to get the focus handler to execute, need to figure out a
// reliable way to do it.
describe.skip('Retarget relatedTarget', () => {
    const URL = 'http://localhost:4567/retarget-null-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should not throw when relatedTarget is null', () => {
        browser.execute(function() {
            document.body.focus();
            document
                .querySelector('integration-retarget-null-related-target')
                .shadowRoot.querySelector('.focus-input')
                .focus();
        });
        const elm = browser.element('.related-target-tabname');
        elm.waitForExist();
        assert.strictEqual(elm.getText(), 'Related target is null');
    });
});
