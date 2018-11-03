const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = 'http://localhost:4567/delegates-focus-false-negative-tab-index';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should not apply focus to input in shadow', () => {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        const activeFromDocument = browser.execute(function () {
            return document.activeElement;
        });

        assert.equal(activeFromDocument.getTagName(), 'integration-delegates-focus-false-negative-tab-index');
        const activeFromShadow = browser.execute(function () {
            return document.querySelector('integration-delegates-focus-false-negative-tab-index').shadowRoot.activeElement;
        });
        assert.equal(activeFromShadow.getTagName(), 'a');
    });
});
