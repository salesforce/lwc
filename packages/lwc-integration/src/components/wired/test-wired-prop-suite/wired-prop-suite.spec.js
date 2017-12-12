const assert = require('assert');

describe('Component with a wired property', () => {
    const URL = 'http://localhost:4567/wired-prop-suite';

    before(() => {
        browser.url(URL);
    });

    it('should display data correctly', () => {
        const element = browser.element('wired-prop');
        assert.equal(element.getText(), 'Title:task 0\nCompleted:true');
    });

    it('should update data correctly', () => {
        const element = browser.element('wired-prop');
        const button = browser.element('button');
        button.click();
        browser.waitUntil(() => {
            return element.getText() === 'Title:task 1\nCompleted:false';
        }, 500, 'expect text to be different after 0.5s');
    });
});
