const assert = require('assert');
describe('Setting AOM property to null from outside', () => {
    const URL = 'http://localhost:4567/accessibility/aomAttributeRemoval/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const element = browser.element('x-child');
        element.click();
        assert.equal( element.getAttribute('aria-label'), 'tab');
    });
});
