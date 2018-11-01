const assert = require('assert');
describe('Event listeners outside of LWC tree', () => {
    const URL = 'http://localhost:4567/event-listener-on-ancestor-current-target';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should report correct target', function () {
        browser.click('.click-div');
        console.log(browser.getText('.target-tag-name'));
        assert.strictEqual(browser.getText('.target-tag-name').toLowerCase(), 'integration-event-listener-on-ancestor-current-target');
    });
});
