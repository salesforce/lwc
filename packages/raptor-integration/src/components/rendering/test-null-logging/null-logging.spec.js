const assert = require('assert');
describe('Issue 720: Wrap all string literal variables with toString method', () => {
    const URL = 'http://localhost:4567/null-logging';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should not have have an error accessing state.foo', function () {
        const hasError = browser.elements('#has-error');
        const noError = browser.elements('#no-error');
        assert.deepEqual(hasError.value.length, 0);
        assert.deepEqual(noError.value.length, 1);
    });
});
