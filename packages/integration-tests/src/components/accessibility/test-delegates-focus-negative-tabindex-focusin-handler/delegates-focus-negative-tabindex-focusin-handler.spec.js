const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = 'http://localhost:4567/delegates-focus-negative-tabindex-focusin-handler';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to input in shadow', function () {
        browser.click('.focusable-input');
        assert.equal(browser.getText('.focus-in-called'), 'Focus in called');
    });
});
