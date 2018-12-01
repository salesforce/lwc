const assert = require('assert');
describe('Testing component: custom-input', () => {
    const URL = 'http://localhost:4567/custom-input';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.strictEqual(title, 'custom-input');
    });

    it('clicking force button should update value', function () {
        return Promise.resolve()
            .then(() => {
                browser.element('button').click();
                return browser.getText('h2');
            })
            .then(text => {
                assert.strictEqual(text, '100');
            })
            .then(() => {
                return browser.element('input[type="range"]').getValue();
            })
            .then(value => {
                assert.strictEqual(value, '100');
            });
    });
});
