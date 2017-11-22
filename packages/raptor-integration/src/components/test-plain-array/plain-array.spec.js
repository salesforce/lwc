const assert = require('assert');
describe('Plain array methods', () => {
    const URL = 'http://localhost:4567/plain-array';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should display unshifted items correctly', function () {
        const elements = browser.elements('#push-list-plain li');
        assert(elements.value[0].getText(), '1');
        assert(elements.value[1].getText(), '2');
        assert(elements.value[2].getText(), '3');
        assert(elements.value[3].getText(), '4');
    });

    it('should display pushed items correctly', function () {
        const elements = browser.elements('#push-list li');
        assert(elements.value[0].getText(), 'first');
        assert(elements.value[1].getText(), 'second');
        assert(elements.value[2].getText(), 'proxy');
        assert(elements.value[3].getText(), 'fourth');
    });

    it('should display concat items correctly', function () {
        const elements = browser.elements('#concat-list-plain li');
        assert(elements.value[0].getText(), '1');
        assert(elements.value[1].getText(), '2');
        assert(elements.value[2].getText(), '3');
        assert(elements.value[3].getText(), '4');
    });

    it('should display concat items correctly', function () {
        const elements = browser.elements('#concat-list-proxy li');
        assert(elements.value[0].getText(), 'first');
        assert(elements.value[1].getText(), 'second');
        assert(elements.value[2].getText(), 'proxy');
    });
});
