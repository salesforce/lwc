const assert = require('assert');
describe('Delegate focus with tabindex 0, no tabbable elements, and no tabbable elements after', () => {
    const URL = 'http://localhost:4567/delegates-focus-tab-index-zero-no-focusable-elements-no-after-elements';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should correctly have no activeelement', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        let active = browser.execute(function () {
            return document.activeElement;
        });

        assert.deepEqual(active.getTagName().toLowerCase(), 'body');
    });
});
