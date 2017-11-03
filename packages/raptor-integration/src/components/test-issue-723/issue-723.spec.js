const assert = require('assert');
describe('Issue 723: Freezing reactive proxy throws when trying to access properties', () => {
    const URL = 'http://localhost:4567/issue-723';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered 3 items', function () {
        const li = browser.elements('li');
        assert.deepEqual(li.value.length, 3);
    });
});
