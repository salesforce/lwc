/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Testing component: record-layout', () => {
    const URL = 'http://localhost:4567/record-layout';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('integration-record-layout');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'record-layout');
        assert.ok(element);
    });

    describe('Record Layout section', function() {
        it('should display titleLabel correctly', function() {
            const element = browser.element('integration-record-layout-section p');
            assert.strictEqual(element.getText(), 'Section: Opportunity Information');
        });
    });

    describe('Record layout leaf', function() {
        it('should display field-api-name correctly', function() {
            const element = browser.element(
                'integration-record-layout-row:nth-child(3) integration-record-layout-leaf p:nth-child(3)',
            );
            assert.strictEqual(element.getText(), 'Field Api Name: AccountId');
        });

        it('should display display-value correctly', function() {
            const element = browser.element(
                'integration-record-layout-row:nth-child(3) integration-record-layout-leaf p:nth-child(2)',
            );
            assert.strictEqual(element.getText(), 'Display value: Acme');
        });

        it('should display value correctly', function() {
            const element = browser.element(
                'integration-record-layout-row:nth-child(3) integration-record-layout-leaf p:nth-child(1)',
            );
            assert.strictEqual(element.getText(), 'Value: 001xx000003DIIxAAO');
        });
    });
});
