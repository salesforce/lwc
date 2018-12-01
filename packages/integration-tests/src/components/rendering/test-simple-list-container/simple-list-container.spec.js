const assert = require('assert');
describe('Testing component: simple-list-container', () => {
    const URL = 'http://localhost:4567/simple-list-container';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('simple-list-container');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'simple-list-container');
        assert.ok(element);
    });

    it('header item', () => {
        assert.strictEqual(browser.element('li.first').getText(), 'header');
    });

    it('footer item', () => {
        assert.strictEqual(browser.element('li.last').getText(), 'footer');
    });

    it('should render number of items between min and max', function () {
        browser.setValue('.mininput', 1);
        browser.setValue('.maxinput', 10);
        const list = browser.elements('integration-simple-list-container .number');
        browser.waitUntil(() => {
            return list.value.length === 9;
        });
        assert.strictEqual(list.value.length, 9);
    });
});
