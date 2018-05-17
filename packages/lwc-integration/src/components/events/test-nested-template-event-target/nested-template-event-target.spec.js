const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/nested-template-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function () {
        browser.execute(function() {
            var child = document.querySelector('x-child');
            child.dispatchFoo();
        });

        const element = browser.element('.evt-target-is-x-child');
        assert.strictEqual(element.getText(), 'Event Target Is x-child');
    });
});
