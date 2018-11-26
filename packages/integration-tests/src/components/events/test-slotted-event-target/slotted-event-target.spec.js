const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/slotted-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function () {
        const select = browser.element('select');
        select.selectByVisibleText('Second');

        const element = browser.element('.target-is-select');
        assert.strictEqual(element.getText(), 'Event Target is select element');
    });
});
