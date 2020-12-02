/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/delegates-focus-focus-method-on-internal-element';

describe('Invoking the focus method on an element inside a shadow tree', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should apply focus (tabindex -1)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('.head');
        });
        await input.click();

        await browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('integration-button.negative')
                .focus();
        });

        const tagName = await browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-internal-element'
            );
            var button = container.shadowRoot.querySelector('integration-button.negative');
            var activeElement = button.shadowRoot.activeElement;
            return activeElement.tagName;
        });

        assert.strictEqual(tagName, 'BUTTON');
    });

    it('should apply focus (tabindex 0)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const head = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('.head');
        });
        await head.click();

        await browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('integration-button.zero')
                .focus();
        });

        const tagName = await browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-internal-element'
            );
            var button = container.shadowRoot.querySelector('integration-button.zero');
            var activeElement = button.shadowRoot.activeElement;
            return activeElement.tagName;
        });

        assert.strictEqual(tagName, 'BUTTON');
    });

    it('should apply focus (no tabindex)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const head = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('.head');
        });
        await head.click();

        await browser.execute(function () {
            document
                .querySelector('integration-delegates-focus-focus-method-on-internal-element')
                .shadowRoot.querySelector('integration-button.none')
                .focus();
        });

        const tagName = await browser.execute(function () {
            var container = document.querySelector(
                'integration-delegates-focus-focus-method-on-internal-element'
            );
            var button = container.shadowRoot.querySelector('integration-button.none');
            var activeElement = button.shadowRoot.activeElement;
            return activeElement.tagName;
        });

        assert.strictEqual(tagName, 'BUTTON');
    });
});
