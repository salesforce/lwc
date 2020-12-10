/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/delegates-focus-click-target-natively-non-focusable';

describe('when the click target is natively non-focusable', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should apply focus to natively focusable parent (button) when click target is custom element', async () => {
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-click-target-natively-non-focusable',
            '.head'
        );
        await input.click();

        // Click on the custom element wrapped by the button
        const child = await browser.shadowDeep$(
            'integration-delegates-focus-click-target-natively-non-focusable',
            'integration-parent',
            'button > integration-child'
        );
        await child.click();

        // The invalid behavior described in issue #1382 causes focus to land on input.tail
        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'integration-child-button');
    });

    it('should apply focus to natively focusable parent (button) when click target is span element', async () => {
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-click-target-natively-non-focusable',
            '.head'
        );
        await input.click();

        // Click on the span wrapped by the button
        const span = await browser.shadowDeep$(
            'integration-delegates-focus-click-target-natively-non-focusable',
            'integration-parent',
            'button > span'
        );
        await span.click();

        // The invalid behavior described in issue #1382 causes focus to land on input.tail
        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'span-button');
    });
});
