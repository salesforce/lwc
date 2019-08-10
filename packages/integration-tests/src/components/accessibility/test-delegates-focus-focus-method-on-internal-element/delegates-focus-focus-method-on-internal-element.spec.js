/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = 'http://localhost:4567/delegates-focus-focus-method-on-internal-element';

describe('Invoking the focus method on an element inside a shadow tree', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should apply focus to the input', function() {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        browser
            .execute(function() {
                return document
                    .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                    .shadowRoot.querySelector('.top');
            })
            .click();

        browser.execute(function() {
            document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('integration-foo[tabindex="-1"]')
                .focus();
        });

        const className = browser.execute(function() {
            var container = document.activeElement;
            var foo = container.shadowRoot.activeElement;
            var input = foo.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'internal');
    });
});
