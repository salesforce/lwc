const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/slotted-custom-element-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function () {
        browser.execute(function () {
            document.querySelector('integration-child').click();
        });
        const elm = browser.element('.correct-event-target');
        elm.waitForExist();
        assert.strictEqual(elm.getText(), 'Event target is correct');
    });
});
