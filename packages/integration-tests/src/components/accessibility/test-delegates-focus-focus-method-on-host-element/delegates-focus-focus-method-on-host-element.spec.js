/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/delegates-focus-focus-method-on-host-element';

describe('Invoking the focus method of a host element', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should apply focus to the host element (tabindex -1)', function () {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        browser
            .$(function () {
                return document
                    .querySelector('integration-delegates-focus-focus-method-on-host-element')
                    .shadowRoot.querySelector('input');
            })
            .click();

        browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-host-element')
                .shadowRoot.querySelector('integration-button.negative')
                .focus();
        });

        const className = browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-host-element'
            );
            var activeElement = container.shadowRoot.activeElement;
            return activeElement.className;
        });

        assert.equal(className, 'negative');
    });

    it('should apply focus to the host element (tabindex 0)', function () {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        browser.execute(function () {
            return document
                .querySelector('integration-delegates-focus-focus-method-on-host-element')
                .shadowRoot.querySelector('input')
                .click();
        });

        browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-host-element')
                .shadowRoot.querySelector('integration-button.zero')
                .focus();
        });

        const className = browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-host-element'
            );
            var activeElement = container.shadowRoot.querySelector('integration-button.zero');
            return activeElement.className;
        });

        assert.equal(className, 'zero');
    });

    it('should apply focus to the host element (no tabindex)', function () {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        browser.execute(function () {
            return document
                .querySelector('integration-delegates-focus-focus-method-on-host-element')
                .shadowRoot.querySelector('input')
                .click();
        });

        browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-host-element')
                .shadowRoot.querySelector('integration-button.none')
                .focus();
        });

        const className = browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-host-element'
            );
            var activeElement = container.shadowRoot.querySelector('integration-button.none');
            return activeElement.className;
        });

        assert.equal(className, 'none');
    });
});
