const assert = require('assert');

describe('event target query selector', () => {
    const URL = 'http://localhost:4567/event-target-queryselector/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should return correct elements', function () {
        const hostContainer = browser.element('x-parent .shadow-div');
        hostContainer.click();
        const values = browser.execute(function () {
            var shadowDiv = document.querySelector('.shadow-div');
            var lightDiv = document.querySelector('.light-div');
            return {
                lightDivSelected: lightDiv.getAttribute('data-selected'),
                shadowDivSelected: shadowDiv.getAttribute('data-selected'),
            };
        });
        assert.equal(values.value.shadowDivSelected, null);
        assert.equal(values.value.lightDivSelected, 'true');
    });
});
