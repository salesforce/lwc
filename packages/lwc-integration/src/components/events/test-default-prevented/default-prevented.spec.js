const assert = require('assert');

// This test is now disable waiting for a proper fix to event.preventDefault()
describe.skip('Composed events', () => {
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
