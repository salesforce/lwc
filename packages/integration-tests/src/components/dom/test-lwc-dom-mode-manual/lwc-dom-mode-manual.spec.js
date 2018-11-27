const assert = require('assert');
describe('LWC Dom manual insertion', () => {
    const URL = 'http://localhost:4567/lwc-dom-mode-manual';

    before(() => {
        browser.url(URL);
    });

    it('should allow manual insertion in manual elements', () => {
        assert.strictEqual(browser.getText('.manual > div'), 'Manual');
    });
});
