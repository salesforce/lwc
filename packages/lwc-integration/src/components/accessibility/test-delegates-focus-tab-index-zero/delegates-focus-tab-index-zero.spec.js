const assert = require('assert');
describe('Delegate focus with tabindex 0', () => {
    const URL = 'http://localhost:4567/delegates-focus-tab-index-zero/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly focus on the input, not custom element', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        const active = browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement.shadowRoot.activeElement;
        });

        assert.deepEqual(active.getTagName().toLowerCase(), 'input')
    });

    it('should correctly focus on the previous element when shift tabbing', function () {
        browser.keys(['Tab']);

        let active = browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement;
        });

        assert.deepEqual(active.getText(), 'second button');

        browser.keys(['Shift', 'Tab']);
        active = browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement.shadowRoot.activeElement;
        });

        assert.deepEqual(active.getTagName().toLowerCase(), 'input');

        browser.keys(['Tab']); // This is a backwards tab, because 'Shift' from previous keys is not released

        active = browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement;
        });
        assert.deepEqual(active.getText(), 'first button');
    });
});
