const assert = require('assert');
describe('Issue 657: Cannot attach event in `connectedCallback`', () => {
    const URL = 'http://localhost:4567/attach-event-connected-callback';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('integration-attach-event-connected-callback');
    });

    it('clicking force button should update value', function () {
        const button = browser.element('button');
        button.click();
        const p = browser.element('p');
        assert.deepEqual(p.getText(), 'Was clicked: true');
    });
});
