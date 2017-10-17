const assert = require('assert');
describe('Issue 720: Wrap all string literal variables with toString method', () => {
    const URL = 'http://localhost:4567/issue-720/issue-720.html';
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

    it('should not have logged a warning about reactive properties', function () {
        const logs = browser.log('browser');
        const warnings = logs.value.filter((log) => {
            return log.level === 'WARNING';
        });
        assert.deepEqual(warnings.length, 0);
    });
});
