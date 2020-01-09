/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Delegate focus with tabindex 0, no tabbable elements, and no tabbable elements after', () => {
    const URL = '/delegates-focus-tab-index-zero-no-focusable-elements-no-after-elements';

    before(() => {
        browser.url(URL);
    });

    it('should correctly have no activeelement', function() {
        browser.keys(['Tab']);
        browser.keys(['Tab']);

        browser.waitUntil(
            () => {
                const active = browser.$(function() {
                    return document.activeElement;
                });
                return active.getTagName().toLowerCase() === 'body';
            },
            undefined,
            'It should focus the body'
        );
    });
});
