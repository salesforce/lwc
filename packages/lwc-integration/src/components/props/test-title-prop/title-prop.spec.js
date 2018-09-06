const assert = require('assert');

describe('Title public prop', () => {
    const URL = 'http://localhost:4567/title-prop';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have rendered title property propertly', function () {
        const element = browser.element('integration-child');
        const text = element.getText();
        assert.deepEqual(text, 'Child title');
    });
});
