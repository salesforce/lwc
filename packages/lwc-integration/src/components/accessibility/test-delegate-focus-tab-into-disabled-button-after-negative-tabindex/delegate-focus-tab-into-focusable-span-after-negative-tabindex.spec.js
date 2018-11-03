const assert = require('assert');
describe('Delegates focus', () => {
    const URL = 'http://localhost:4567/delegate-focus-tab-into-disabled-button-after-negative-tabindex';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function () {
        browser.keys(['Tab']); // tab into first anchor
        browser.keys(['Tab']); // tab into second anchor
        browser.keys(['Tab']); // tab over integration-child
        const active = browser.execute(function () {
            return document.activeElement;
        });
        assert.equal(active.getTagName(), 'body');
    });
});
