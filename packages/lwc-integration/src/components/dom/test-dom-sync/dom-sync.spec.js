const assert = require('assert');
describe('Dom synchronization', () => {
    const URL = 'http://localhost:4567/dom-sync';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('dom-sync');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'dom-sync');
        assert.ok(element);
    });

    it('sync', function () {
        let checks = browser.elements('input');
        checks.value[0].click();
        assert.equal(checks.value[0].isSelected(), true);
        checks.value[1].click();
        assert.equal(checks.value[1].isSelected(), true);

        const button = browser.element('button');
        button.click();

        checks = browser.elements('input');
        assert.equal(checks.value[0].isSelected(), false);
        assert.equal(checks.value[1].isSelected(), true);
    });
});
