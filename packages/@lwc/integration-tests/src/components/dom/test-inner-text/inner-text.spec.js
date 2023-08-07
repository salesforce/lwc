/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

/**
 * innerText polyfill relies on the browser selection API.
 * Unfortunately, because of a bug in Chrome and Safari browsers,
 * an input becomes unusable when clicked and while handling the click event  the (polyfilled) innerText is computed
 *
 * Minimal repro of Chrome and Safari issue: https://gist.github.com/nolanlawson/c7d8ed3d43dbb4a018fb392467fae365
 *
 * Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=1208631
 * Safari bug: https://bugs.webkit.org/show_bug.cgi?id=225723
 */
describe('innerText computations in input click handler', () => {
    const URL = '/inner-text/';

    before(async () => {
        await browser.url(URL);
    });

    it('should allow to type in input when input.innerText is computed in the handler', async () => {
        const target = await browser.shadowDeep$(
            'integration-inner-text',
            'input.handler-computes-inner-text-input'
        );
        await target.click();

        await browser.keys('test value');

        const actual = await target.getValue();
        assert.strictEqual(actual, 'test value');
    });

    it('should allow to type in input when (other element) div.innerText is computed in the handler', async () => {
        const target = await browser.shadowDeep$(
            'integration-inner-text',
            'input.handler-computes-inner-text-div'
        );
        await target.click();

        await browser.keys('test value');

        const actual = await target.getValue();
        assert.strictEqual(actual, 'test value');
    });
});
