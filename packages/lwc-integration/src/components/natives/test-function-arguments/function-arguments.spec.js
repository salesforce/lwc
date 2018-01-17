const assert = require('assert');
describe('Function arguments', () => {
    const URL = 'http://localhost:4567/function-arguments';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have correct message', () => {
        const el = browser.element('.message-assert');
        assert(el.getText(), 'bar');
    });

    it('should iterate correctly', () => {
        const elements = browser.elements('.iterate-list li');
        assert(elements.value[0].getText(), '2');
        assert(elements.value[1].getText(), '3');
        assert(elements.value[2].getText(), '4');
    });
});
