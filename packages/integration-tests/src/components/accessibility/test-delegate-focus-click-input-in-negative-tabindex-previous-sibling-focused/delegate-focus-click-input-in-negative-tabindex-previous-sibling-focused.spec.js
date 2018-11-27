const assert = require('assert');

// The bug: Cannot click into the first child of a shadow root when the active element is
// the previous sibling to the custom element


describe('Delegates focus', () => {
    const URL = 'http://localhost:4567/delegate-focus-click-input-in-negative-tabindex-previous-sibling-focused';

    before(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function () {
        browser.keys(['Tab']); // focus first anchor
        browser.keys(['Tab']); // focus second anchor
        browser.click('input'); // click into input
        const active = browser.execute(function () {
            return document.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.equal(active.getTagName(), 'input');
    });
});
