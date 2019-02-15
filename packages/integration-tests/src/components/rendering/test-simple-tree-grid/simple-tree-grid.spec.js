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
        const toggleAnchor = browser.element('integration-tree-node a');
        assert.ok(toggleAnchor);

        let nodes = browser.elements('integration-tree-node2');
        assert.ok(nodes);
        assert.equal(nodes.value.length, 3);
        toggleAnchor.click();

        nodes = browser.elements('integration-tree-node2');
        assert.ok(nodes);
        assert.equal(nodes.value.length, 1);
    });
});
