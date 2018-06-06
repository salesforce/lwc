const assert = require('assert');
describe('Issue 627: Named slot doesn\'t work properly.', () => {
    const URL = 'http://localhost:4567/slot-render-elements';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function () {
        const text = browser.execute(function () {
            var text = document.querySelector('x-child').textContent;;
            var exists = document.querySelector('#content-in-slot') !== null;
            return {
                text: text,
                exists: exists,
            };
        });
        assert.equal(text.value.text, 'Content rendered in slot');
        assert.equal(text.value.exists, true);
    });
});
