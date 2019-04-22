/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Testing component: simple-list-container', () => {
    const URL = 'http://localhost:4567/simple-tree-grid';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('integration-simple-tree-grid');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'simple-tree-grid');
        assert.ok(element);
    });

    it('toggle collapsible', () => {
        function getNodesCount() {
            const count = browser.execute(function() {
                var treeNodes = document
                    .querySelector('integration-simple-tree-grid')
                    .shadowRoot.querySelector('integration-tree-grid')
                    .shadowRoot.querySelectorAll('integration-tree-node');
                if (treeNodes.length === 2) {
                    var node2s =
                        treeNodes[0].shadowRoot.querySelectorAll('integration-tree-node2').length +
                        treeNodes[1].shadowRoot.querySelectorAll('integration-tree-node2').length;
                    return node2s;
                }
                return 0;
            });
            return count.value;
        }
        const preCount = getNodesCount();
        assert.equal(preCount, 3, 'expected 3 items in list');
        browser.execute(function() {
            return document
                .querySelector('integration-simple-tree-grid')
                .shadowRoot.querySelector('integration-tree-grid')
                .shadowRoot.querySelector('integration-tree-node')
                .shadowRoot.querySelector('a')
                .click();
        });

        const postCount = getNodesCount();
        assert.equal(postCount, 1, 'expect 1 item in list after collapsing');
    });
});
