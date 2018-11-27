const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = 'http://localhost:4567/retarget-null-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should not throw when relatedTarget is null', () => {
        browser.execute(function () {
            document.querySelector('integration-retarget-null-related-target').shadowRoot.querySelector('.focus-input').focus();
        })
        browser.waitUntil(() => {
            const text = browser.getText('.related-target-tabname');
            return text === 'Related target is null';
        }, 500, ' Related target should be null');
    });
});
