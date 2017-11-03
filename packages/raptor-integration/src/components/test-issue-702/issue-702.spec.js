const assert = require('assert');
describe('Issue 702: [proxy-compat] Error: Setting property "Symbol(Symbol.iterator) during the rendering', () => {
    const URL = 'http://localhost:4567/issue-702';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('issue-702');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'issue-702');
        assert.ok(element);
    });

    it('should render items', function () {
        const items = browser.elements('compat-item');
        assert.equal(items.value.length, 2);
        assert.equal(items.value[0].getText(), 'Item: P1');
        assert.equal(items.value[1].getText(), 'Item: P2');
    });
});
