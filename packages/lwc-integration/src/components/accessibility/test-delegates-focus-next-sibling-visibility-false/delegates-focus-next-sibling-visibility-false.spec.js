const assert = require('assert');

describe('Tabbing into custom element proceeding an invisible button', () => {
    const URL = 'http://localhost:4567/delegates-focus-next-sibling-visibility-false';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to the document body', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        const activeFromDocument = browser.execute(function ()  {
            return document.activeElement;
        });
        assert.equal(activeFromDocument.getTagName(), 'body');
    });
});
