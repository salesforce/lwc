const assert = require('assert');
describe('Composed events', () => {
    const URL = 'http://localhost:4567/default-prevented';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('x-child');
        element.click();
        const defaultPreventedIndicator = browser.element('.default-prevented-indicator');
        assert.deepEqual(defaultPreventedIndicator.getText(), 'Default Prevented');
    });
});
