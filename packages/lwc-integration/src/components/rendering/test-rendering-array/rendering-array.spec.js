const assert = require('assert');
describe('Issue 702: [proxy-compat] Error: Setting property "Symbol(Symbol.iterator) during the rendering', () => {
    const URL = 'http://localhost:4567/rendering-array';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('rendering-array');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'rendering-array');
        assert.ok(element);
    });

    it('should render items', function () {
        const text = browser.execute(function () {
            return [].map.call(document.querySelectorAll('compat-item'), function (item) {
                return {
                    text: item.textContent,
                };
            });
        });
        assert.equal(text.value.length, 2);
        assert.equal(text.value[0].text, 'Item: P1');
        assert.equal(text.value[1].text, 'Item: P2');
    });
});
