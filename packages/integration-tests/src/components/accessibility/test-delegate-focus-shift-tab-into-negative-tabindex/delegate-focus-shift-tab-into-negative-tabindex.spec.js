const assert = require('assert');
describe('Delegates focus', () => {
    const URL = 'http://localhost:4567/delegate-focus-shift-tab-into-negative-tabindex';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function () {
        browser.keys(['Tab']); // tab into first anchor
        browser.keys(['Tab']); // tab into second anchor
        browser.keys(['Tab']); // tab over integration-child
        browser.keys(['Shift', 'Tab']); // tab backwards over integration-child
        const active = browser.execute(function () {
            return document.querySelector('integration-delegate-focus-shift-tab-into-negative-tabindex').shadowRoot.activeElement;
        });
        assert.equal(active.getText(), 'Anchor 2');
    });
});
