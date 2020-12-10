/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tab-navigation-tabindex-zero';

describe('Tab navigation when tabindex 0', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should focus on custom element when tabbing forward from a sibling element', async () => {
        const secondOutside = await browser.shadowDeep$(
            'integration-tab-navigation-tabindex-zero',
            '.second-outside'
        );
        await secondOutside.click();
        await browser.keys(['Tab']);

        var activeElementHost = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElementHost.getTagName(), 'integration-child');

        const activeElementShadow = await browser.execute(function (host) {
            return host.shadowRoot.activeElement;
        }, activeElementHost);
        assert.strictEqual(activeElementShadow, null);
    });

    it('should focus on internal element when tabbing forward twice from a sibling element', async () => {
        const secondOutside = await browser.shadowDeep$(
            'integration-tab-navigation-tabindex-zero',
            '.second-outside'
        );
        await secondOutside.click();
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');
    });

    it('should focus on internal element when tabbing backwards from a sibling element', async () => {
        const thirdOutside = await browser.shadowDeep$(
            'integration-tab-navigation-tabindex-zero',
            '.third-outside'
        );
        await thirdOutside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-inside');
    });

    it('should focus on custom element when tabbing backwards out of the shadow', async () => {
        const firstInside = await browser.shadowDeep$(
            'integration-tab-navigation-tabindex-zero',
            'integration-child',
            '.first-inside'
        );
        await firstInside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'integration-child');
    });
});
