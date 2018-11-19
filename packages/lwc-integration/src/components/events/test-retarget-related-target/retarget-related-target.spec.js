const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = 'http://localhost:4567/retarget-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should retarget relatedTarget from a foreign shadow', () => {
        browser.execute(function () {
            document.querySelector('integration-child input').focus();
        });
        browser.keys(['Shift', 'Tab']);
        assert.equal(browser.getText('.related-target-tabname'), 'integration-child')
    });
});
