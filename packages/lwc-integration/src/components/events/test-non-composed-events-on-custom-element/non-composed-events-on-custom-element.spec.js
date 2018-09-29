const assert = require('assert');

describe('Non-composed events', () => {
    const URL = 'http://localhost:4567/non-composed-events-on-custom-element';

    before(() => {
        browser.url(URL);
    });

    it('should dispatch Event on the custom element', function () {
        browser.element('integration-child').click();
        assert.ok(browser.element('.event-received-indicator'));
    });

    it('should dispatch CustomEvent on the custom element', function () {
        browser.element('integration-child').click();
        assert.ok(browser.element('.custom-event-received-indicator'));
    });
});
