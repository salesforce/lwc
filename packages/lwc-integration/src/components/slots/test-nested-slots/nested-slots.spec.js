const assert = require('assert');
describe('Slots with empty iterators should render', () => {
    const URL = 'http://localhost:4567/nested-slots';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function () {
        const result = browser.execute(() => {
            return document.querySelector('integration-nested-slots').getRegisteredTabs();
        });
        assert.ok(result);
        assert.equal(result.value, 2);
    });
});
