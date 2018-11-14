const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = 'http://localhost:4567/retarget-null-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should not throw when relatedTarget is null', () => {
        browser.click('.focus-input')
        assert.equal(browser.getText('.related-target-tabname'), 'Related target is null')
    });
});
