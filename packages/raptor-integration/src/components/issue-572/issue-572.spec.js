const assert = require('assert');
describe('Issue 572: [brain-dump] problems with accessibility and semantic markup in raptor', () => {
    const URL = 'http://localhost:4567/issue-572/issue-572.html';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('issue-572');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'issue-572');
        assert.ok(element);
    });

    it('should have rendered a li with correct is attribute', function () {
        const items = browser.elements('li');
        assert.equal(items.value.length, 2);
        assert.equal(items.value[0].getAttribute('is'), 'x-listitem');
        assert.equal(items.value[1].getAttribute('is'), 'x-listitem');
        assert.equal(items.value[0].getText(), 'Item 1');
        assert.equal(items.value[1].getText(), 'Item 2');
    });
});