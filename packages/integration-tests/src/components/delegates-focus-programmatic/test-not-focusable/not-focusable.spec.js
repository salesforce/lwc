/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/not-focusable';

describe('when there are no focusable elements in the shadow', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should not change the currently focused element', async () => {
        const first = await browser.$(function () {
            return document
                .querySelector('integration-not-focusable')
                .shadowRoot.querySelector('.first');
        });
        await first.click();

        await browser.execute(function () {
            var container = document.querySelector('integration-not-focusable');
            var child = container.shadowRoot.querySelector('integration-child');
            child.focus();
        });

        const className = await browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement.className;
        });
        assert.strictEqual(className, 'first');
    });
});
