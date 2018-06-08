const assert = require('assert');
describe('Title public prop', () => {
    const URL = 'http://localhost:4567/title-prop';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered title property propertly', function () {
        const text = browser.execute(function () {
            return document.querySelector('x-child').textContent;
        });
        assert.deepEqual(text.value, 'Child title');
    });
});
