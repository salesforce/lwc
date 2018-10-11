const assert = require('assert');

describe('shadow root element from point should return correct element', () => {
    const URL = 'http://localhost:4567/element-from-point/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should return correct shadow elements', function () {
        browser.click('.shadow-element-from-point');
        assert.equal(browser.getText('.correct-shadow-element-indicator'), 'Correct shadow element selected');
    });

    it('should return correct document elements', function () {
        browser.click('.document-from-point');
        assert.equal(browser.getText('.correct-document-element-indicator'), 'Correct document element selected');
    });
});
