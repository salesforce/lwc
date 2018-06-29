const assert = require('assert');
describe('Async event target', () => {
    const URL = 'http://localhost:4567/async-event-target';

    before(() => {
        browser.url(URL);
    });

    it('should be root node', function () {
        browser.click('x-child');
        assert.deepEqual(browser.getText('.correct-sync-target'), 'Correct sync target');
        browser.waitUntil(() => {
            return browser.getText('.correct-async-target') === 'Correct async target';
        }, 500, 'Expecd async target to be <async-event-target>');
    });
});
