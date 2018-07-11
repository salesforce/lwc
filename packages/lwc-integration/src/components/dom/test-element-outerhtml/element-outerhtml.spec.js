const assert = require('assert');

describe('custom element text content', () => {
    const URL = 'http://localhost:4567/element-outerhtml/';

    before(() => {
        browser.url(URL);
    });

    it('should return correct innerHTML', function () {
        assert.equal(browser.getText('p'), '<x-child><div>Slot</div></x-child>');
    });
});
