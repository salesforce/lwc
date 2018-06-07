const assert = require('assert');
describe('Slots with empty iterators should render', () => {
    const URL = 'http://localhost:4567/empty-slot-iterator';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function () {
        const text = browser.execute(function () {
            var element = document.querySelector('x-child');
            return element.textContent;
        });

        assert.equal(text.value, 'Rendered ok');
    });
});
