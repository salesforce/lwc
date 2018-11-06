const assert = require('assert');

describe('Circular JSON stringity on shadow root', () => {
    const URL = 'http://localhost:4567/json-stringify-shadow-root';

    before(() => {
        browser.url(URL);
    });

    it('should not throw when running json stringify on shadow root', function () {
        assert.strictEqual(browser.getText('.error-message'), 'no error');
    });
});
