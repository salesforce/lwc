const assert = require('assert');

describe.skip('Retarget relatedTarget', () => {
    const URL = 'http://localhost:4567/retarget-null-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should not throw when relatedTarget is null', () => {
        return Promise.resolve()
            .then(() => {
                browser.execute(function () {
                    document.body.focus();
                    document
                        .querySelector('integration-retarget-null-related-target')
                        .shadowRoot
                        .querySelector('.focus-input')
                        .focus();
                });
            })
            .then(() => {
                return browser.getText('.related-target-tabname');
            })
            .then(text => {
                assert.strictEqual(text, 'Related target is null');
            });
    });
});
