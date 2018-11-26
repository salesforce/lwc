const assert = require('assert');
describe('Setting AOM property on anchor tag', () => {
    const URL = 'http://localhost:4567/anchor-aom-setter';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should set AOM property without error', function () {
        browser.click('button');
        assert.deepEqual(browser.getText('.error-text'), 'no error');
    });
});
