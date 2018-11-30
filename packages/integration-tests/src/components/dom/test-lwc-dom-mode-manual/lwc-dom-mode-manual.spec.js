const assert = require('assert');
describe('LWC Dom manual insertion', () => {
    const URL = 'http://localhost:4567/lwc-dom-mode-manual';

    before(() => {
        browser.url(URL);
    });

    it('should allow manual insertion in manual elements', () => {
        assert.strictEqual(browser.getText('.manual > div'), 'Manual');
    });

    it('should set shadow stylesheet key on inserted elements', () => {
        var value = browser.execute(function () {
            var host = document.querySelector('integration-lwc-dom-mode-manual');
            var div = host.shadowRoot.querySelector('div');
            return {
                hasHostKey: host.hasAttribute('integration-lwc-dom-mode-manual_lwc-dom-mode-manual-host'),
                hasShadowKey: div.hasAttribute('integration-lwc-dom-mode-manual_lwc-dom-mode-manual')
            };
        }).value;

        // template driven
        assert.strictEqual(value.hasHostKey, true);
        // manual driven
        assert.strictEqual(value.hasShadowKey, true);
    });
});
