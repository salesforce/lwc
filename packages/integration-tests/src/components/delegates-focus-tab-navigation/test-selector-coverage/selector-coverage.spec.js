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
    'areaHref',
    'audioControls',
    'button',
    'checkbox',
    //    'detailsEmpty',
    //    'embedSrc',
    'iframe',
    'iframeSrc',
    'input',
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

    it('should result in expected sequential focus navigation', function() {
        // Focus on the first input outside the table
        const start = browser.$(function() {
            return document
                .querySelector('integration-selector-coverage')
                .shadowRoot.querySelector('.start');
        });
        start.click();

        // Continue sequential focus navigation until we reach the last input
        // outside the table.
        const visited = [];
        let lastComponentType;
        let componentType;

        // Normalize browser differences for focusable/non-focusable elements
        // by repeatedly tabbing until we detect a new shadow host.
        do {
            browser.keys(['Tab']);
            componentType = browser.execute(() => {
                var activeElement = document.activeElement;
                // The active element is sometimes unexpectedly null during
                // sequential focus navigation in IE11
                if (!activeElement) {
                    return;
                }
                while (activeElement.shadowRoot) {
                    activeElement = activeElement.shadowRoot.activeElement;
                }
                if (activeElement.matches('input.done')) {
                    return 'DONE';
                }
                var rootNode = activeElement.getRootNode();
                return rootNode.host.type;
            });
            if (componentType !== 'DONE' && componentType !== lastComponentType) {
                visited.push(componentType);
                lastComponentType = componentType;
            }
        } while (componentType !== 'DONE');

        assert.deepEqual(focusable, visited);
    });
});
