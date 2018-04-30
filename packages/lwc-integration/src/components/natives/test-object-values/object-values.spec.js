const assert = require('assert');

describe('Object.values', () => {
    const URL = 'http://localhost:4567/natives/objectValues';

    before(() => {
        browser.url(URL);
    });

    describe('Plain Object', () => {
        it('should return proper value for simple object', () => {
            const element = browser.element('#simple');
            assert.strictEqual(element.getText(), 'x|42');
        });

        it('should return proper value for array-like object', () => {
            const element = browser.element('#array-like');
            assert.strictEqual(element.getText(), 'a|b|c');
        });

        it('should return ordered keys', () => {
            const element = browser.element('#unordered');
            assert.strictEqual(element.getText(), 'b|c|a');
        });

        it('should omit not-enumerable properties', () => {
            const element = browser.element('#not-enumerable');
            assert.strictEqual(element.getText(), 'z');
        });

        it('should handle non-object values', () => {
            const element = browser.element('#non-object');
            assert.strictEqual(element.getText(), 'f|o|o');
        });

        it('should omit symbol properties', () => {
            const element = browser.element('#symbol');
            assert.strictEqual(element.getText(), 'x|42');
        });
    });

    describe('Proxy Object', () => {
        it('should return proper value for simple object', () => {
            const element = browser.element('#simple-proxy');
            assert.strictEqual(element.getText(), 'x|42');
        });

        it('should return proper value for array-like object', () => {
            const element = browser.element('#array-like-proxy');
            assert.strictEqual(element.getText(), 'a|b|c');
        });

        it('should return ordered keys', () => {
            const element = browser.element('#unordered-proxy');
            assert.strictEqual(element.getText(), 'b|c|a');
        });

        it('should omit not-enumerable properties', () => {
            const element = browser.element('#not-enumerable-proxy');
            assert.strictEqual(element.getText(), 'z');
        });

        it('should omit symbol properties', () => {
            const element = browser.element('#symbol-proxy');
            assert.strictEqual(element.getText(), 'x|42');
        });
    });
});
