const assert = require('assert');

describe('Locator Sanity Check', () => {
    const URL = 'http://localhost:4567/locator-check';

    before(() => {
        browser.url(URL);
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'locator-check');
    });

    // need to figure out how to run these tests. add more tests
});
