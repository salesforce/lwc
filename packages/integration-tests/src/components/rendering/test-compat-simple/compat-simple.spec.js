const assert = require('assert');
describe('Testing component: compat-simple', () => {
    const URL = 'http://localhost:4567/compat-simple';

    before(() => {
        browser.url(URL);
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'compat-simple');
    });

    it('render', () => {
        const element = browser.element('integration-compat-simple');
        assert.ok(element);
        assert.equal(element.getText(), 'default');
    });

    it('update text (involves method call)', () => {
        browser.execute(function() {
            document.querySelector('integration-compat-simple').changeComputedText();
        });
        return Promise.resolve()
            .then(() => {
                return browser.getText('integration-compat-simple');
            })
            .then(text => {
                text === 'default#changed';
            });
    });
});
