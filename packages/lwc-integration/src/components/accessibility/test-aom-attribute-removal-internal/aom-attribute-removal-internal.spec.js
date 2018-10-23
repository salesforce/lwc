const assert = require('assert');
describe('Setting AOM property to null from outside', () => {
    const URL = 'http://localhost:4567/aom-attribute-removal-internal';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const element = browser.element('integration-child');
        element.click();
        assert.equal(element.getAttribute('aria-label'), 'tab');
    });
});
