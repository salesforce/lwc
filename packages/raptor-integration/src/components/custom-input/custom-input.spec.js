const assert = require('assert');
describe('Testing component: custom-input', () => {
    const URL = 'http://localhost:4567/custom-input/custom-input.html';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('custom-input');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'custom-input');
        assert.ok(element);
    });

    it('clicking force button should update value', function () {
        const button = browser.element('button');
        const input = browser.element('input[type="range"]');
        button.click();
        const h2 = browser.element('h2');
        assert.deepEqual(h2.getText(), '100');
        assert.deepEqual(input.getValue(), '100');
        browser.execute(() => {
            const range = document.querySelector('input[type="range"]');
            range.value = 10;
        });
        assert.deepEqual(input.getValue(), '10');
    });
});