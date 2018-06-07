const assert = require('assert');
describe('Slots with empty iterators should render', () => {
    const URL = 'http://localhost:4567/empty-slot-iterator';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function () {
        const element = browser.element('x-child');
        assert.equal(element.getText(), 'Rendered ok');
    });
});
