const assert = require('assert');
describe('Testing component: compat-simple', () => {
    const COMPAT_SIMPLE_URL = 'http://localhost:4567/rendering/compatExpando/';

    it('page load', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const title = browser.getTitle();
        assert.equal(title, 'compatExpando');
    });
});
