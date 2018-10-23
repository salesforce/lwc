const assert = require('assert');
describe('Setting AOM property to null from outside', () => {
    const URL = 'http://localhost:4567/aom-attribute-removal';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly remove the attribute from custom element', function () {
        const element = browser.element('integration-child');
        element.click();
        assert.equal( element.getAttribute('aria-label'), null);
    });
});
