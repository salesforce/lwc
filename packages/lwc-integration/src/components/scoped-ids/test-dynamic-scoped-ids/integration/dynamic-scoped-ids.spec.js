const assert = require('assert');
const URL = 'http://localhost:4567/dynamic-scoped-ids';

describe('Scoped ids (dynamic)', () => {
    before(() => {
        browser.url(URL);
    });

    describe('should be transformed', function () {
        it('aria-activedescendant', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.activedescendant-id');
                var idrefElm = document.querySelector('.activedescendant-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-activedescendant'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'activedescendant', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'activedescendant', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-details', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.details-id');
                var idrefElm = document.querySelector('.details-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-details'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'details', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'details', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-errormessage', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.errormessage-id');
                var idrefElm = document.querySelector('.errormessage-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-errormessage'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'errormessage', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'errormessage', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-flowto', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.flowto-id');
                var idrefElm = document.querySelector('.flowto-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-flowto'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'flowto', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'flowto', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
    });
});
