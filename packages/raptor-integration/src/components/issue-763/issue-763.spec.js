const assert = require('assert');
describe('Object keys', () => {
    const URL = 'http://localhost:4567/issue-763/issue-763.html';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should display unshifted items correctly', function () {
        const el = browser.element('#unshift-list');
        el.click();
        const elements = browser.elements('#unshift-list li');
        assert(elements.value[0].getText(), 'unshifted');
        assert(elements.value[1].getText(), 'first');
        assert(elements.value[2].getText(), 'second');
    });

    it('should display pushed items correctly', function () {
        const el = browser.element('#push-list');
        el.click();
        const elements = browser.elements('#push-list li');
        assert(elements.value[0].getText(), 'first');
        assert(elements.value[1].getText(), 'second');
        assert(elements.value[2].getText(), 'pushed');
    });

    it('should display concat items correctly', function () {
        const el = browser.element('#concat-list');
        el.click();
        const elements = browser.elements('#concat-list li');
        assert(elements.value[0].getText(), 'first');
        assert(elements.value[1].getText(), 'second');
        assert(elements.value[2].getText(), 'concat 1');
        assert(elements.value[3].getText(), 'concat 2');
    });
});
