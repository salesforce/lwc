const assert = require('assert');
describe('Default AOM values on Shadow Root', () => {
    const URL = 'http://localhost:4567/shadow-root-aom';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const element = browser.element('shadow-root-aom');
        assert.equal( element.getAttribute('aria-label'), 'internallabel');
    });
});
