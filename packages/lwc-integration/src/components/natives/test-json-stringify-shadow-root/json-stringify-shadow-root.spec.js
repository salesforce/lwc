const assert = require('assert');

describe('Circular JSON stringity on shadow root', () => {
    const URL = 'http://localhost:4567/json-stringify-shadow-root';

    before(() => {
        browser.url(URL);
    });

    it('should not throw when running json stringify on shadow root', function () {
        browser.waitUntil(() => {
            return browser.getText('.error-message') === 'no error';
        }, 500, 'Expect there to be no error');
    });
});
