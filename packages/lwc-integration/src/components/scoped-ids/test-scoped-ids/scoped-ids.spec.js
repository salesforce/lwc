const assert = require('assert');
const URL = 'http://localhost:4567/scoped-ids';

describe('Scoped ids', () => {
    before(() => {
        browser.url(URL);
    });

    it('should transform ids as they are passed down', () => {
        const { inner, outer } = browser.execute(() => {
            var outerElm = document.querySelector('integration-scoped-ids');
            var innerElm = document.querySelector('integration-child');
            return {
                inner: innerElm.getAttribute('id'),
                outer: outerElm.getAttribute('id'),
            };
        }).value;
        assert(inner.length > 0, 'id attr should be non-empty string');
        assert.notStrictEqual(inner, outer, 'inner id and outer id should be different');
    });

    it('static and dynamic id should be the same', () => {
        const { staticValue, dynamicValue } = browser.execute(() => {
            var staticElm = document.querySelector('.static');
            var dynamicElm = document.querySelector('.dynamic');
            return {
                staticValue: staticElm.getAttribute('id'),
                dynamicValue: dynamicElm.getAttribute('id'),
            };
        }).value;
        assert.strictEqual(staticValue, dynamicValue);
    });
});
