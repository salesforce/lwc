const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/slotted-native-element-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function () {
        browser.click('p');
        browser.waitForVisible('.correct-event-target');
        assert.strictEqual(browser.getText('.correct-event-target'), 'Event target is correct');
    });
});
