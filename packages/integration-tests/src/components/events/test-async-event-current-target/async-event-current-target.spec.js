const assert = require('assert');
describe('Async event currentTarget', () => {
    const URL = 'http://localhost:4567/async-event-current-target';

    before(() => {
        browser.url(URL);
    });

    it('should be null', function () {
        browser.click('div');
        browser.waitUntil(() => {
            return browser.getText('.current-target-is-null') === 'Current Target is null';
        }, 1000, 'Expected async current target to be null');
    });
});
