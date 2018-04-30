const assert = require('assert');
describe('Composed events', () => {
    const URL = 'http://localhost:4567/events/composedEvents/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('x-child');
        element.click();
        const receiveEventElement = browser.element('.event-received-indicator');
        assert.ok(receiveEventElement);
    });
});
