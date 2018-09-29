const assert = require('assert');
describe('setAttribute', () => {
    const URL = 'http://localhost:4567/set-attribute';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly set attribute on custom element', function () {
        const element = browser.element('integration-set-attribute');
        assert.equal( element.getAttribute('customattribute'), 'bar');
    });
});
