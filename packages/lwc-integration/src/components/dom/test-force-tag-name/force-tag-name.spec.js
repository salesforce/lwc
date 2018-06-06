const assert = require('assert');
describe('Issue 572: [brain-dump] problems with accessibility and semantic markup in lwc', () => {
    const URL = 'http://localhost:4567/force-tag-name';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('force-tag-name');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'force-tag-name');
        assert.ok(element);
    });

    it('should have rendered a li with correct is attribute', function () {
        const elements = browser.execute(function () {
            var items = document.querySelectorAll('li');
            return [].map.call(items, function (li) {
                return {
                    is: li.getAttribute('is'),
                    text: li.textContent,
                }
            });
        });

        assert.equal(elements.value.length, 2);
        assert.equal(elements.value[0].is, 'list-item');
        assert.equal(elements.value[1].is, 'list-item');
        assert.equal(elements.value[0].text, 'Item 1');
        assert.equal(elements.value[1].text, 'Item 2');
    });
});
