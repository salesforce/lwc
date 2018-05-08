const assert = require('assert');
describe('Object keys', () => {
    const URL = 'http://localhost:4567/rendering/formTag/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('.form-text');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'Form did render');
    });
});
