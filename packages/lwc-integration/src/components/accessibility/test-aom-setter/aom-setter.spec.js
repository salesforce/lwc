const assert = require('assert');
describe('Component AOM Setter', () => {
    const URL = 'http://localhost:4567/aom-setter';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly call setter for AOM property', function () {
        const element = browser.element('.internal-label');
        assert.equal(browser.element('x-child').getAttribute('aria-label'), null);
        assert.equal( element.getText(), 'label');
    });
});
