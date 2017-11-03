const assert = require('assert');
describe('Issue 627: Named slot doesn\'t work properly.', () => {
    const URL = 'http://localhost:4567/issue-627';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered element in slot correctly', function () {
        const element = browser.element('x-child');
        assert.equal(element.getText(), 'Content rendered in slot');
        assert.ok(browser.element('#content-in-slot'));
    });
});
