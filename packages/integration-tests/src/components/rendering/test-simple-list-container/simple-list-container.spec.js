/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Testing component: simple-list-container', () => {
    const URL = 'http://localhost:4567/simple-list-container';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('simple-list-container');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'simple-list-container');
        assert.ok(element);
    });

    it('header item', () => {
        assert.strictEqual(browser.element('li.first').getText(), 'header');
    });

    it('footer item', () => {
        assert.strictEqual(browser.element('li.last').getText(), 'footer');
    });

    it('should render number of items between min and max', function () {
        var rangeChangeButton = browser.element('button.rangechange');

        // set min to 1 and max to 10
        rangeChangeButton.click();

        browser.waitForExist('li.number[data-number="1"]');
        assert.strictEqual(browser.elements('li.number').value.length, 9);
    });
});
