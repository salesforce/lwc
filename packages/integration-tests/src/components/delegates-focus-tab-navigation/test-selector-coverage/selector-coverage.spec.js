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
        const visited = [];
        let lastComponentType;
        let componentType;
        do {
            browser.keys(['Tab']);
            componentType = browser.execute(function() {
                var activeElement = document.activeElement;
                while (activeElement.shadowRoot) {
                    activeElement = activeElement.shadowRoot.activeElement;
                }
                var rootNode = activeElement.getRootNode();
                return rootNode.host.type;
            });
            if (componentType !== null && componentType !== lastComponentType) {
                visited.push(componentType);
                lastComponentType = componentType;
            }
        } while (componentType);

        assert.deepEqual(focusable, visited);
    });
});
