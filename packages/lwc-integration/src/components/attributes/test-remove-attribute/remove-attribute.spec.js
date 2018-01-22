const assert = require('assert');
describe('removeAttribute', () => {
    const URL = 'http://localhost:4567/remove-attribute';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const element = browser.element('remove-attribute');
        assert.equal(element.getAttribute('title'), '');
    });
});
