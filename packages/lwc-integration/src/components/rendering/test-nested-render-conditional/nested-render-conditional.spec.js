const assert = require('assert');
describe('Nested conditional render', () => {
    const URL = 'http://localhost:4567/rendering/nestedRenderConditional';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should toggle element with nested conditional', function () {
        const clickElement = browser.element('.click-me');
        clickElement.click();
        const toggleElement = browser.elements('.toggle');
        assert.deepEqual(toggleElement.value.length, 0);
    });
});
