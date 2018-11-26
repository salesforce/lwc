const assert = require('assert');

describe('custom element text content', () => {
    const URL = 'http://localhost:4567/element-textcontent/';

    before(() => {
        browser.url(URL);
    });

    it('should return correct textContent', function () {
        assert.equal(browser.getText('p'), 'Slot');
    });
});
