/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/delegates-focus-focus-method-on-internal-element';

describe('Invoking the focus method on an element inside a shadow tree', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should apply focus (tabindex -1)', function () {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('.head');
        });

        input.click();

        browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('integration-button.negative')
                .focus();
        });

        const tagName = browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-internal-element'
            );
            var button = container.shadowRoot.querySelector('integration-button.negative');
            var activeElement = button.shadowRoot.activeElement;
            return activeElement.tagName;
        });

        assert.equal(tagName, 'BUTTON');
    });

    it('should apply focus (tabindex 0)', function () {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        browser
            .$(function () {
                return document
                    .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                    .shadowRoot.querySelector('.head');
            })
            .click();

        browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('integration-button.zero')
                .focus();
        });

        const tagName = browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-internal-element'
            );
            var button = container.shadowRoot.querySelector('integration-button.zero');
            var activeElement = button.shadowRoot.activeElement;
            return activeElement.tagName;
        });

        assert.equal(tagName, 'BUTTON');
    });

    it('should apply focus (no tabindex)', function () {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        browser
            .$(function () {
                return document
                    .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                    .shadowRoot.querySelector('.head');
            })
            .click();

        browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('integration-button.none')
                .focus();
        });

        const tagName = browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-internal-element'
            );
            var button = container.shadowRoot.querySelector('integration-button.none');
            var activeElement = button.shadowRoot.activeElement;
            return activeElement.tagName;
        });

        assert.equal(tagName, 'BUTTON');
    });
});
