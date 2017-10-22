const assert = require('assert');
describe('Object keys', () => {
    const URL = 'http://localhost:4567/nested-state/nested-state.html';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('#key');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'yes');
    });
});
