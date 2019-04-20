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
        const first = browser.execute(function() {
            return document
                .querySelector('integration-simple-list-container')
                .shadowRoot.querySelector('integration-simple-list')
                .shadowRoot.querySelector('li.first');
        });
        assert.strictEqual(first.getText(), 'header');
    });

    it('footer item', () => {
        const last = browser.execute(function() {
            return document
                .querySelector('integration-simple-list-container')
                .shadowRoot.querySelector('integration-simple-list')
                .shadowRoot.querySelector('li.last');
        });
        assert.strictEqual(last.getText(), 'footer');
    });

    it('should render number of items between min and max', function() {
        // set min to 1 and max to 10
        browser.execute(function() {
            return document
                .querySelector('integration-simple-list-container')
                .shadowRoot.querySelector('button.rangechange')
                .click();
        });

        browser.waitUntil(
            () => {
                var listItem = browser.execute(function() {
                    document
                        .querySelector('integration-simple-list-container')
                        .shadowRoot.querySelector('integration-simple-list')
                        .shadowRoot.querySelector('li.number[data-number="1"]');
                });
                return listItem.value !== null;
            },
            500,
            'list component did not rerender'
        );
        const items = browser.execute(function() {
            return document
                .querySelector('integration-simple-list-container')
                .shadowRoot.querySelector('integration-simple-list')
                .shadowRoot.querySelectorAll('li.number');
        });
        assert.strictEqual(items.value.length, 9);
    });
});
