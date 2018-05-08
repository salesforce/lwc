const assert = require('assert');
describe('Aria attributes on native elements', () => {
    const URL = 'http://localhost:4567/accessibility/ariaAttributeNativeElement';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly call setter for AOM property', function () {
        const element = browser.element('aria-attribute-native-element div');
        assert.equal(element.getAttribute('aria-label'), 'nativeelement');
    });
});
