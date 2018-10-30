const assert = require('assert');
const URL = 'http://localhost:4567/static-scoped-ids';

describe('Scoped ids (static)', () => {
    before(() => {
        browser.url(URL);
    });

    describe('should be transformed', function () {
        it('aria-controls', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.controls-id');
                var idrefElm = document.querySelector('.controls-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-controls'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'controls', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'controls', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-describedby', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.describedby-id');
                var idrefElm = document.querySelector('.describedby-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-describedby'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'describedby', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'describedby', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-labelledby', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.labelledby-id');
                var idrefElm = document.querySelector('.labelledby-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-labelledby'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'labelledby', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'labelledby', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('aria-owns', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.owns-id');
                var idrefElm = document.querySelector('.owns-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('aria-owns'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'owns', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'owns', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
        it('for', () => {
            const { id, idref } = browser.execute(() => {
                var idElm = document.querySelector('.for-id');
                var idrefElm = document.querySelector('.for-idref');
                return {
                    id: idElm.getAttribute('id'),
                    idref: idrefElm.getAttribute('for'),
                };
            }).value;
            assert(id.length > 0, 'id attr should be non-empty string');
            assert.notStrictEqual(id, 'for', 'id attr should be transformed');
            assert.notStrictEqual(idref, 'for', 'idref attr should be transformed');
            assert(id === idref, 'id attr and idref attr should be the same value');
        });
    });
});
