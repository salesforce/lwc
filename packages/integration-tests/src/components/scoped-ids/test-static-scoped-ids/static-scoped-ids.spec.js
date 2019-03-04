/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/static-scoped-ids';

describe('Scoped ids (static)', () => {
    before(() => {
        browser.url(URL);
    });

    describe('should be transformed', function() {
        it('aria-controls', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-static-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.controls-id');
                var idrefElm = integration.shadowRoot.querySelector('.controls-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaControls,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'controls', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'controls', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-describedby', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-static-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.describedby-id');
                var idrefElm = integration.shadowRoot.querySelector('.describedby-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaDescribedBy,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'describedby', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'describedby', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-labelledby', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-static-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.labelledby-id');
                var idrefElm = integration.shadowRoot.querySelector('.labelledby-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaLabelledBy,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'labelledby', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'labelledby', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-owns', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-static-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.owns-id');
                var idrefElm = integration.shadowRoot.querySelector('.owns-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaOwns,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'owns', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'owns', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
    });
});
