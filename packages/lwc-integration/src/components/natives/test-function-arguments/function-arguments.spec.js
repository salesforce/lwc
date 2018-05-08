const assert = require('assert');
describe('Function arguments', () => {
    const URL = 'http://localhost:4567/natives/functionArguments';

    before(() => {
        browser.url(URL);
    });

    it('should have correct message', () => {
        const element = browser.element('.message-assert');
        assert.strictEqual(element.getText(), 'bar');
    });

    it('should iterate correctly', () => {
        const elements = browser.elements('.iterate-list li');
        assert.strictEqual(elements.value[0].getText(), '2');
        assert.strictEqual(elements.value[1].getText(), '3');
        assert.strictEqual(elements.value[2].getText(), '4');
    });
});
