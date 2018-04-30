const assert = require('assert');
describe('Issue 791: [IE11] Radio Buttons are not rendering with correct value', () => {
    const URL = 'http://localhost:4567/dom/radioGroupValue';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should get correct value from radio button', function () {
        const radio = browser.element('#radiobtn');
        radio.click();
        const text = browser.element('#value');
        assert.equal(text.getText(), 'secondbutton');
    });
});
