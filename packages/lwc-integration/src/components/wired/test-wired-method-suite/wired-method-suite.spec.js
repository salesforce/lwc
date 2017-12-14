const assert = require('assert');

describe('Component with a wired method', () => {
    const URL = 'http://localhost:4567/wired-method-suite';

    before(() => {
        browser.url(URL);
    });

    it('should display data correctly', () => {
        const element = browser.element('wired-method');
        assert.equal(element.getText(), 'Title:task 0 Completed:true');
    });

    it('should update data correctly', () => {
        const element = browser.element('wired-method');
        const button = browser.element('button');
        button.click();
        browser.waitUntil(() => {
            return element.getText() === 'Title:task 1 Completed:false';
        }, 500, 'expect text to be different after 0.5s');
    });
});
