/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/invoke-focus-on-click';

/*
This regression test reproduces a very specific scenario where an element's focus() method is
invoked immediately after the mousedown event listener on the global document:

1) mousedown (disable)
2) patched focus method
  - (disable)
  - invoke original focus method
  - (enable)
3) focusin (programmatic focus management) <-- expectation is to be disabled here
4) mouseup (enable)

The mousedown and mouseup events are used as hooks to disable/enable keyboard focus navigation
for focus delegation, and the unexpected invocation of the focus() method was breaking that by
enabling keyboard focus navigation before the subsequent focusin event listener which is used to
implement shadow semantics for keyboard focus navigation.
*/
describe('[W-8350504] focus() method invocation, inside a focus handler, triggered by a click', () => {
    before(() => {
        browser.url(URL);
    });

    it('should not interfere with focusing the clicked element', function () {
        browser.keys(['Tab']); // input.before
        const button = browser.$(function () {
            return document
                .querySelector('integration-invoke-focus-on-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('button');
        });
        button.click(); // click into button
        const active = browser.$(function () {
            return document
                .querySelector('integration-invoke-focus-on-click')
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.strictEqual(active.getTagName(), 'button');
    });
});
