const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = 'http://localhost:4567/delegates-focus-from-previous-sibling';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to input in shadow', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        browser.keys(['Shift', 'Tab']);

        const activeFromDocument = browser.execute(() => {
            return document.activeElement;
        });
        assert.equal(activeFromDocument.getTagName(), 'integration-delegates-focus-from-previous-sibling');
        const activeFromShadow = browser.execute(() => {
            return document.querySelector('integration-delegates-focus-from-previous-sibling').shadowRoot.activeElement;
        });
        assert.equal(activeFromShadow.getTagName(), 'integration-child');
    });
});
