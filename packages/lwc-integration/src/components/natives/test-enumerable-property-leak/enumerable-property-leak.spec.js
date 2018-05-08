const assert = require('assert');
describe('Array prototype methods', () => {
    const URL = 'http://localhost:4567/natives/enumerablePropertyLeak';

    before(() => {
        browser.url(URL);
    });

    it('should not leak any properties on Object', () => {
        const el = browser.element('#object-enumerable-properties');
        assert.strictEqual(el.getText(), 'x,y');
    });

    it('should not leak any properties on Array', () => {
        const el = browser.element('#array-enumerable-properties');
        assert.strictEqual(el.getText(), '0,1');
    });
});
