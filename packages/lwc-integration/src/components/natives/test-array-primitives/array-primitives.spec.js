const assert = require('assert');
describe('Testing array primitives', () => {
    const URL = 'http://localhost:4567/array-primitives';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'array-primitives');
        assert.ok(element);
    });

    it('check initial state', function () {
        const items = browser.execute(function () {
            return document.querySelector('integration-array-primitives').shadowRoot.querySelector('li').length;
        });

        assert.equal(items.value, items.length);
    });
});
