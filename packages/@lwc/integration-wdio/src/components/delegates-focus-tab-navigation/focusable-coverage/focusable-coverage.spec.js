/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('sequential focus navigation coverage', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    describe('should focus', () => {
        [
            'anchorHref',
            'areaHref',
            'audioControls',
            'button',
            'checkbox',
            // 'detailsEmpty', // focusable in chrome and firefox but not in safari
            // 'embedSrc', // focusable in all browsers except for windows chrome
            'iframe',
            'iframeSrc',
            'input',
            'inputTime',
            // 'objectData', // focusable in chrome and firefox but not in safari
            'select',
            'selectMultiple',
            'selectOptgroup',
            'spanContenteditable',
            'spanTabindexZero',
            // 'summaryInsideDetails', // focusable in chrome/firefox/safari but only when inside <details>
            // 'summaryInsideDetailsMultiple',
            'svgAnchorHref',
            // 'svgAnchorXlinkHref', // a[xlink:href] should only be focusable when inside <svg>
            'textarea',
            'videoControls',
        ].forEach((type) => {
            it.skip(type, async () => {
                // Click and focus on the first input
                const start = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.start');
                await start.click();

                // Set the type
                await browser.execute(async function (type) {
                    const container = document.querySelector(`integration-${TEST_NAME}`);
                    container.type = type;
                    await new Promise(requestAnimationFrame); // wait a tick
                }, type);

                await browser.keys(['Tab']);

                await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

                const activeElement = await browser.activeElementShadowDeep();
                assert.strictEqual(await activeElement.getAttribute('data-focus'), type);
            });
        });
    });
});
