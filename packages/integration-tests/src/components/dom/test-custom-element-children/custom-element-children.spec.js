/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('children, childNodes, childElementCount', () => {
    const URL = 'http://localhost:4567/custom-element-children//';

    before(() => {
        browser.url(URL);
    });

    it('should return correct number of children', () => {
        browser.waitUntil(() => {
            return browser.getText('.children-length') === '0'
        }, 500, 'Children count should be 0')
    });

    it('should return correct number of childNodes', () => {
        browser.waitUntil(() => {
            return browser.getText('.childnodes-length') === '0'
        }, 500, 'childNode count should be 0')
    });

    it('should return correct number of shadowRoot children', () => {
        browser.waitUntil(() => {
            return browser.getText('.shadow-children-length') === '2'
        }, 500, 'shadow root children count should be 2')
    });

    it('should return correct number of shadowRoot children', () => {
        browser.waitUntil(() => {
            return browser.getText('.shadow-childnodes-length') === '2'
        }, 500, 'shadow root children count should be 2')
    });

    it('should return correct number of shadowRoot childElementCount', () => {
        browser.waitUntil(() => {
            return browser.getText('.child-element-count') === '0'
        }, 500, 'shadow root children count should be 2')
    });

    it('should return correct number of shadowRoot childElementCount', () => {
        browser.waitUntil(() => {
            return browser.getText('.shadow-root-child-element-count') === '2'
        }, 500, 'shadow root children count should be 2')
    });
});
