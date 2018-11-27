const assert = require('assert');

describe('Event Target on window event listener', () => {
    const URL = 'http://localhost:4567/window-event-listener/';

    before(() => {
        browser.url(URL);
    });

    it('should return correct target', function () {
        browser.click('button');
        assert.deepEqual(browser.getText('.window-event-target-tagname'), 'integration-window-event-listener');
    });
});
