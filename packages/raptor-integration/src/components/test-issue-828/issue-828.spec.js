const assert = require('assert');
describe('Issue 828 Object assign', () => {
    const URL = 'http://localhost:4567/issue-828';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should return proper value', function () {
        const element = browser.element('#assign');
        assert(element.getText(), 'foo');
    });
});
