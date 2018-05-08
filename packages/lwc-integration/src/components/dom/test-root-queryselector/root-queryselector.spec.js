const assert = require('assert');
describe('Testing component: app-list', () => {
    const URL = 'http://localhost:4567/dom/rootQueryselector';

    before(() => {
        browser.url(URL);
    });

    it('should not render an error', function () {
        const elem = browser.element('root-queryselector');
        const noerror = browser.elements('#no-error');
        const error = browser.elements('#error');
        assert.equal(noerror.value.length, 1);
        assert.equal(error.value.length, 0);
        assert.equal(elem.getText(), 'No Error');
    });
});
