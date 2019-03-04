/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/dynamic-scoped-ids';

describe('Scoped ids (dynamic)', () => {
    before(() => {
        browser.url(URL);
    });

    describe('should be transformed', function() {
        it('aria-activedescendant', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-dynamic-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.activedescendant-id');
                var idrefElm = integration.shadowRoot.querySelector('.activedescendant-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaActiveDescendant,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'activedescendant', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'activedescendant', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-details', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-dynamic-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.details-id');
                var idrefElm = integration.shadowRoot.querySelector('.details-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaDetails,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'details', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'details', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-errormessage', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-dynamic-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.errormessage-id');
                var idrefElm = integration.shadowRoot.querySelector('.errormessage-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaErrorMessage,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'errormessage', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'errormessage', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-flowto', () => {
            const { id, idref } = browser.execute(function() {
                var integration = document.querySelector('integration-dynamic-scoped-ids');
                var idElm = integration.shadowRoot.querySelector('.flowto-id');
                var idrefElm = integration.shadowRoot.querySelector('.flowto-idref');
                return {
                    id: idElm.id,
                    idref: idrefElm.ariaFlowTo,
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'flowto', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'flowto', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
    });
});
