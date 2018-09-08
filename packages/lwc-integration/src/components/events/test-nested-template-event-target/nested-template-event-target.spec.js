const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/nested-template-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function () {
        browser.execute(function() {
            var child = document.querySelector('integration-child');
            child.dispatchFoo();
        });

        browser.waitForVisible('.evt-target-is-x-child');
        const element = browser.element('.evt-target-is-x-child');
        assert.strictEqual(element.getText(), 'Event Target Is x-child');
    });
});
