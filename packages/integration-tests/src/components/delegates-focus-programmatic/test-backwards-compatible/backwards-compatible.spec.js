/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/backwards-compatible';

describe('when the component overrides the focus method', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should continue custom focus behavior', function () {
        browser.execute(function () {
            return document
                .querySelector('integration-backwards-compatible')
                .shadowRoot.querySelector('integration-child')
                .focus();
        });
        const className = browser.execute(function () {
            var active = document.activeElement;
            while (active.shadowRoot) {
                active = active.shadowRoot.activeElement;
            }
            return active.className;
        });
        assert.equal(className, 'internal-textarea');
    });
});
