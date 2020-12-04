/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-negative-after-inside-click';

describe('Tab navigation when tabindex -1 after inside click', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should continue skipping elements (forward)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-negative-after-inside-click',
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await secondInside.click();
        const secondOutside = await browser.shadowDeep$(
            'integration-tabindex-negative-after-inside-click',
            '.second-outside'
        );
        await secondOutside.click();
        await browser.keys(['Tab']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'third-outside');
    });

    it('should continue skipping elements after navigating out (forward)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-negative-after-inside-click',
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await secondInside.click();
        await browser.keys(['Tab']); // third inside
        await browser.keys(['Tab']); // third outside

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'third-outside');
    });

    it('should continue skipping elements (backward)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-negative-after-inside-click',
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await secondInside.click();
        const thirdOutside = await browser.shadowDeep$(
            'integration-tabindex-negative-after-inside-click',
            '.third-outside'
        );
        await thirdOutside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'second-outside');
    });

    it('should continue skipping elements after navigating out (backwards)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-negative-after-inside-click',
            'integration-child[data-id=click-target]',
            '.second-inside'
        );
        await secondInside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']); // first inside
        await browser.keys(['Shift', 'Tab', 'Shift']); // second outside

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'second-outside');
    });
});
