/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('test pre dom-insertion setAttribute and removeAttribute functionality', () => {
    const URL = 'http://localhost:4567/attributes-suite';

    before(() => {
        browser.url(URL);
    });

    it('should set user defined attribute value', () => {
        const childElm = browser.element('my-child');
        assert.equal(childElm.getAttribute('title'), 'im child title');

        // verify via element
        const titleAttrDivElm = browser.element('.titleattr');
        assert.equal(titleAttrDivElm.getText(), 'im child title');
    }),

    it('should remove user specified attribute', () => {
        const childElm = browser.element('my-child');
        assert.notEqual(childElm.getAttribute('tabindex'), '4');

        // verify via element
        const tabAttrElm = browser.element('.tabindexattr');
        assert.notEqual(tabAttrElm.getText(), '4');
    })
})
