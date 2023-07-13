/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/focusable-coverage';

describe('sequential focus navigation coverage', () => {
    beforeEach(async () => {
        await browser.url(URL);
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
            it(type, async () => {
                // Click and focus on the first input
                const start = await browser.shadowDeep$('integration-focusable-coverage', '.start');
                await start.click();

                // Set the type
                await browser.execute(function (type) {
                    var container = document.querySelector('integration-focusable-coverage');
                    container.type = type;
                }, type);

                await browser.keys(['Tab']);

                const activeElement = await browser.activeElementShadowDeep();
                assert.strictEqual(await activeElement.getAttribute('data-focus'), type);
            });
        });
    });
});
