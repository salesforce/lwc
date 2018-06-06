const assert = require('assert');

describe('Component with a wired method', () => {
    const URL = 'http://localhost:4567/wired-method-suite';

    before(() => {
        browser.url(URL);
    });

    it('should display data correctly', () => {
        const text = browser.execute(function () {
            return document.querySelector('wired-method').textContent;
        });
        assert.equal(text.value, 'Title:task 0 Completed:true');
    });

    it('should update data correctly', () => {
        const element = browser.element('wired-method');
        const button = browser.element('button');
        button.click();
        browser.waitUntil(() => {
            const text = browser.execute(function () {
                return document.querySelector('wired-method').textContent;
            });
            return text.value === 'Title:task 1 Completed:false';
        }, 500, 'expect text to be different after 0.5s');
    });
});
