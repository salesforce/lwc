const assert = require('assert');
describe('Toggling to empty classname', () => {
    const URL = 'http://localhost:4567/rendering/toggleEmptyClassname';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have the right value', function () {
        const element = browser.element('toggle-empty-classname');
        element.click();

        const className = browser.getAttribute('toggle-empty-classname div', 'class');
        assert.deepEqual(className, '');
    });
});
