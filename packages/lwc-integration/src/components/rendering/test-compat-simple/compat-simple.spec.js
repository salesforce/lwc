const assert = require('assert');
describe('Testing component: compat-simple', () => {
    const COMPAT_SIMPLE_URL = 'http://localhost:4567/compat-simple';

    it('page load', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const title = browser.getTitle();
        assert.equal(title, 'compat-simple');
    });

    it('render', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const text = browser.execute(function () {
            return document.querySelector('compat-simple').textContent;
        });
        assert.equal(text.value, 'default');
    });

    it('update text (involves method call)', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const text = browser.execute(function() {
            var el = document.querySelector('compat-simple');
            el.changeComputedText();
            return el.textContent;
        });

        assert.ok(text.value, 'default#changed');
    });

});
