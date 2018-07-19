const assert = require('assert');
describe('Composed focusout event', () => {
    const URL = 'http://localhost:4567/focusout-composed-true';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should be composed', function () {
        browser.click('input');
        browser.click('body');
        browser.pause(50);
        assert.deepEqual(browser.getText('.focus-out-composed'), 'Focus Out Composed');

        browser.click('button');
        assert.deepEqual(browser.getText('.custom-focus-out-not-composed'), 'Custom Focus Out Not Composed');
    });
});
