/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Component with a wired property', () => {
    const URL = 'http://localhost:4567/wired-prop-suite';

    before(() => {
        browser.url(URL);
    });

    it('should display data correctly', () => {
        const element = browser.element('integration-wired-prop');
        assert.equal(element.getText(), 'Title:task 0 Completed:true');
    });

    it('should update data correctly', () => {
        const element = browser.element('integration-wired-prop');
        const button = browser.element('button');
        button.click();
        browser.waitUntil(
            () => {
                return element.getText() === 'Title:task 1 Completed:false';
            },
            500,
            'expect text to be different after 0.5s',
        );
    });
});
