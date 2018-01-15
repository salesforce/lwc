const assert = require('assert');

describe('Cross-origin contentWindow communication', () => {
    const URL = 'http://localhost:4567/unwrap-crossorigin-iframe';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should not throw error', function () {
        const button = browser.element('button');
        button.click();
        const text = browser.element('.error');
        assert.equal(text.getText(), 'no error');
    });
});
