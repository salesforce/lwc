const assert = require('assert');

describe('parentElement from top-level shadow element', () => {
    const URL = 'http://localhost:4567/shadow-element-parent-element/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should return correct elements', function () {
        assert.equal(browser.getText('.parent-is-correct'), 'Parent is correct');
    });
});
