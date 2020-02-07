/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/selector-coverage';

const focusable = [
    'anchorHref',
    'areaHrefSquare',
    'audioControls',
    'button',
    'checkbox',
    //    'detailsEmpty',
    //    'embedSrc',
    'iframe',
    //    'iframeSrc',
    'input',
    'inputTime',
    'inputTime',
    //    'objectData',
    'select',
    'selectMultiple',
    'selectOptgroup',
    'spanContenteditable',
    'spanTabindexZero',
    //    'summaryInsideDetails',
    //    'summaryInsideDetailsMultiple',
    'svgAnchorHref',
    //    'svgAnchorXlinkHref',
    'textarea',
    'videoControls',
];

describe('selector coverage', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should transfer focus to the body', function() {
        // Focus on the first input outside the table
        const first = browser.$(function() {
            return document
                .querySelector('integration-selector-coverage')
                .shadowRoot.querySelector('.first');
        });
        first.click();

        // Continue sequential focus navigation until we reach the last input
        // outside the table.
        const focusIds = [];
        let focusId;
        do {
            browser.keys(['Tab']);
            focusId = browser.execute(function() {
                var active = document.activeElement;
                while (active.shadowRoot) {
                    active = active.shadowRoot.activeElement;
                }
                return active.dataset.focus;
            });
            if (focusId) {
                focusIds.push(focusId);
            }
        } while (focusId);

        assert.deepEqual(focusable, focusIds);
    });
});
