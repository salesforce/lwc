const assert = require('assert');
describe('Default AOM values on Shadow Root', () => {
    const URL = 'http://localhost:4567/pass-null-aria-attribute-to-custom-element';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const hasAttribute = browser.execute(function () {
            return document.querySelector('x-child').hasAttribute('aria-label');
        });
        assert.equal(hasAttribute.value, false);
    });
});
