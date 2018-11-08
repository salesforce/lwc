const assert = require('assert');
describe('Dynamic text nodes rendering duplicate text', () => {
    const URL = 'http://localhost:4567/duplicate-text-rendering';

    before(() => {
        browser.url(URL);
    });

    it('should not render duplicate text', function () {
        browser.click('integration-duplicate-text-rendering');
        assert.notDeepEqual(browser.getText('integration-duplicate-text-rendering'), 'ab');
        assert.deepEqual(browser.getText('integration-duplicate-text-rendering'), 'b');
    });
});
