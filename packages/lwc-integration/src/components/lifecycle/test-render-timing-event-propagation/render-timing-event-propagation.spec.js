const assert = require('assert');

describe('Render timing:', () => {
    const URL = 'http://localhost:4567/render-timing-event-propagation';

    before(() => {
        browser.url(URL);
    });

    it('should not render before event propagation completes', () => {
        const button = browser.element('integration-button');
        button.click();
        assert.strictEqual(button.getAttribute('fail'), null);
    });
});
