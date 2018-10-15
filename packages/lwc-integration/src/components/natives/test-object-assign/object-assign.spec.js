const assert = require('assert');

describe('Issue 828 - Object assign', () => {
    const URL = 'http://localhost:4567/object-assign';

    before(() => {
        browser.url(URL);
    });

    it('should return proper value', function () {
        const element = browser.element('.assign');
        assert.strictEqual(element.getText(), 'foo');
    });
});
