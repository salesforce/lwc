const assert = require('assert');
describe('Object keys', () => {
    const URL = 'http://localhost:4567/natives/weakSet/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('#weak-set');
        assert.ok(element);
        assert.deepEqual(element.getText(), 'Weak set');
    });
});
