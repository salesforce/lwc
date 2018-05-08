const assert = require('assert');

describe('Object.entries', () => {
    const URL = 'http://localhost:4567/natives/objectEntries';

    before(() => {
        browser.url(URL);
    });

    describe('Plain Object', () => {
        it('should return proper value for simple object', () => {
            const element = browser.element('#simple');
            assert.strictEqual(element.getText(), 'x,x|y,42');
        });

        it('should return proper value for array-like object', () => {
            const element = browser.element('#array-like');
            assert.strictEqual(element.getText(), '0,a|1,b|2,c');
        });

        it('should return ordered keys', () => {
            const element = browser.element('#unordered');
            assert.strictEqual(element.getText(), '2,b|7,c|100,a');
        });

        it('should omit not-enumerable properties', () => {
            const element = browser.element('#not-enumerable');
            assert.strictEqual(element.getText(), 'z,z');
        });

        it('should handle non-object values', () => {
            const element = browser.element('#non-object');
            assert.strictEqual(element.getText(), '0,f|1,o|2,o');
        });

        it('should omit symbol properties', () => {
            const element = browser.element('#symbol');
            assert.strictEqual(element.getText(), 'x,x|y,42');
        });

        it('should support iterable protocol', () => {
            const element = browser.element('#iterable');
            assert.strictEqual(element.getText(), '[x:x][y:42]');
        });

        it('should support array operations', () => {
            const element = browser.element('#array-operation');
            assert.strictEqual(element.getText(), '[x:x][y:42]');
        });
    });

    describe('Proxy Object', () => {
        it('should return proper value for simple object', () => {
            const element = browser.element('#simple-proxy');
            assert.strictEqual(element.getText(), 'x,x|y,42');
        });

        it('should return proper value for array-like object', () => {
            const element = browser.element('#array-like-proxy');
            assert.strictEqual(element.getText(), '0,a|1,b|2,c');
        });

        it('should return ordered keys', () => {
            const element = browser.element('#unordered-proxy');
            assert.strictEqual(element.getText(), '2,b|7,c|100,a');
        });

        it('should omit not-enumerable properties', () => {
            const element = browser.element('#not-enumerable-proxy');
            assert.strictEqual(element.getText(), 'z,z');
        });

        it('should omit symbol properties', () => {
            const element = browser.element('#symbol-proxy');
            assert.strictEqual(element.getText(), 'x,x|y,42');
        });

        it('should support iterable protocol', () => {
            const element = browser.element('#iterable-proxy');
            assert.strictEqual(element.getText(), '[x:x][y:42]');
        });

        it('should support array operations', () => {
            const element = browser.element('#array-operation-proxy');
            assert.strictEqual(element.getText(), '[x:x][y:42]');
        });
    });
});
