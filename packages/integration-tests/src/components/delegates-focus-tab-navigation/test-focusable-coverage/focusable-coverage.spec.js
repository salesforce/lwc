/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/focusable-coverage';

// 'detailsEmpty',
// 'embedSrc',
// 'objectData',
// 'summaryInsideDetails',
// 'summaryInsideDetailsMultiple',
// 'svgAnchorXlinkHref',

describe('sequential focus navigation coverage', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    describe('should focus', () => {
        // This test suite fails in ie11 for some unknown reason
        if (browser.config.capabilities.commonName === 'ie11') {
            return;
        }

        [
            'anchorHref',
            'areaHref',
            'audioControls',
            'button',
            'checkbox',
            'iframe',
            'iframeSrc',
            'input',
            'inputTime',
            'select',
            'selectMultiple',
            'selectOptgroup',
            'spanContenteditable',
            'spanTabindexZero',
            'svgAnchorHref',
            'textarea',
            'videoControls',
        ].forEach(type => {
            it(type, () => {
                // Click and focus on the first input
                const start = browser.$(function() {
                    return document
                        .querySelector('integration-focusable-coverage')
                        .shadowRoot.querySelector('.start');
                });
                start.click();

                // Set the type
                browser.execute(function(type) {
                    var container = document.querySelector('integration-focusable-coverage');
                    var child = container.shadowRoot.querySelector('integration-child');
                    child.type = type;
                }, type);

                browser.keys(['Tab']);

                const activeElementType = browser.execute(function() {
                    const container = document.activeElement;
                    const child = container.shadowRoot.activeElement;
                    const elm = child.shadowRoot.activeElement;
                    return elm.dataset.focus;
                });

                assert.strictEqual(activeElementType, type);
            });
        });
    });
});
