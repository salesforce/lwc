const assert = require('assert');
describe('Issue 572: [brain-dump] problems with accessibility and semantic markup in lwc', () => {
    const URL = 'http://localhost:4567/dom/forceTagName';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('force-tag-name');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'forceTagName');
        assert.ok(element);
    });

    it('should have rendered a li with correct is attribute', function () {
        const items = browser.elements('li');
        assert.equal(items.value.length, 2);
        assert.equal(items.value[0].getAttribute('is'), 'list-item');
        assert.equal(items.value[1].getAttribute('is'), 'list-item');
        assert.equal(items.value[0].getText(), 'Item 1');
        assert.equal(items.value[1].getText(), 'Item 2');
    });
});
