const assert = require('assert');
describe('Delegate focus with tabindex 0 and no tabbable elements', () => {
    const URL = 'http://localhost:4567/delegates-focus-tab-index-zero-no-focusable-elements';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly skip the custom element', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        let active = browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement;
        });

        assert.deepEqual(active.getText(), 'second button')

        browser.keys(['Shift', 'Tab']);

        active = browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement;
        });

        assert.deepEqual(active.getText(), 'first button');
    });
});
