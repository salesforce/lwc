const assert = require('assert');
describe('@api prop mutation errors', () => {
    const URL = 'http://localhost:4567/mutate-api-error';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should throw error when trying to modify @api value in child', () => {
        const clickEl = browser.element('.click');
        clickEl.click();
        const errorEl = browser.element('.error-message');
        assert.deepEqual(errorEl.getText(), 'Invalid mutation: Cannot set "x" on "[object Object]". "[object Object]" is read only.');
    });
});
