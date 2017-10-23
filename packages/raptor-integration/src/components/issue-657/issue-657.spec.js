const assert = require('assert');
describe('Issue 657: Cannot attach event in `connectedCallback`', () => {
    const URL = 'http://localhost:4567/issue-657/issue-657.html';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('issue-657');
    });

    it('clicking force button should update value', function () {
        const button = browser.element('button');
        button.click();
        const p = browser.element('p');
        assert.deepEqual(p.getText(), 'Was clicked: true');
    });
});
