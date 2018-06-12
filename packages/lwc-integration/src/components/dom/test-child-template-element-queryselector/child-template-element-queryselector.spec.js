const assert = require('assert');

describe('event target query selector', () => {
    const URL = 'http://localhost:4567/child-template-element-queryselector/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should return correct elements', function () {
        browser.execute(function () {
            document.querySelector('child-template-element-queryselector').click();
        });
        const shadowDiv = browser.element('.shadow-div');
        assert.equal(shadowDiv.getAttribute('data-selected'), null);
        const lightDiv = browser.element('.light-div');
        assert.equal(lightDiv.getAttribute('data-selected'), 'true');
    });
});
