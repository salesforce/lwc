const assert = require('assert');
describe('Title public prop', () => {
    const URL = 'http://localhost:4567/props/titleProp/';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered title property propertly', function () {
        const li = browser.element('x-child');
        assert.deepEqual(li.getText(), 'Child title');
    });
});
