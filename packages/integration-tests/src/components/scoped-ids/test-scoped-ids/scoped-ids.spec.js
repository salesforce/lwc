/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/scoped-ids';

describe('Scoped ids', () => {
    before(() => {
        browser.url(URL);
    });

    it('should transform ids as they are passed down', () => {
        const { inner, outer } = browser.execute(function() {
            var integration = document.querySelector('integration-scoped-ids');
            var outerElm = integration.shadowRoot.querySelector('integration-child');
            var innerElm = outerElm.shadowRoot.querySelector('p');
            return {
                inner: innerElm.id,
                outer: outerElm.id,
            };
        }).value;
        assert(inner.length > 0, 'id attr should be non-empty string');
        assert.notStrictEqual(inner, outer, 'inner id and outer id should be different');
    });

    it('static and dynamic id should be the same', () => {
        const { staticValue, dynamicValue } = browser.execute(function() {
            var integration = document.querySelector('integration-scoped-ids');
            var staticElm = integration.shadowRoot.querySelector('.static');
            var dynamicElm = integration.shadowRoot.querySelector('.dynamic');
            return {
                staticValue: staticElm.id,
                dynamicValue: dynamicElm.id,
            };
        }).value;
        assert.strictEqual(staticValue, dynamicValue);
    });
});
