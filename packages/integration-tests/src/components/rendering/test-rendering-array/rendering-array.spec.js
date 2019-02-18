/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Issue 702: [proxy-compat] Error: Setting property "Symbol(Symbol.iterator) during the rendering', () => {
    const URL = 'http://localhost:4567/rendering-array';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('integration-rendering-array');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'rendering-array');
        assert.ok(element);
    });

    it('should render items', function() {
        const items = browser.elements('integration-compat-item');
        assert.equal(items.value.length, 2);
        assert.equal(items.value[0].getText(), 'Item: P1');
        assert.equal(items.value[1].getText(), 'Item: P2');
    });
});
