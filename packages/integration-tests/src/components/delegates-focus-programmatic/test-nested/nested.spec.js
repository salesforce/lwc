/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/nested';

describe('when the only focusable element is in a nested shadow', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should apply focus in the nested shadow', function () {
        const button = browser.$(function () {
            return document.querySelector('integration-nested').shadowRoot.querySelector('button');
        });
        button.click();
        const className = browser.execute(function () {
            var active = document.activeElement;
            while (active.shadowRoot) {
                active = active.shadowRoot.activeElement;
            }
            return active.className;
        });
        assert.equal(className, 'child-input');
    });
});
