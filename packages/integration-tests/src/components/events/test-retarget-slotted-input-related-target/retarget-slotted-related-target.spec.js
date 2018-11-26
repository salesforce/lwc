const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = 'http://localhost:4567/retarget-slotted-input-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should have correct relatedTarget from slotted input', () => {
        browser.execute(function () {
            document.querySelector('.slotted-input').focus();
        });
        browser.keys(['Shift', 'Tab']);
        assert.equal(browser.getText('.related-target-tagname'), 'input')
    });
});
