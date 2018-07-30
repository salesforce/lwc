const assert = require('assert');
describe('Composed events', () => {
    const URL = 'http://localhost:4567/composed-events';

    before(() => {
        browser.url(URL);
    });

    it('should dispatch Event on the custom element', function () {
        browser.element('x-child').click();
        assert.ok(browser.element('.event-received-indicator'));
    });

    it('should dispatch CustomEvent on the custom element', function () {
        browser.element('x-child').click();
        assert.ok(browser.element('.custom-event-received-indicator'));
    });
});
