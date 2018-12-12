const assert = require('assert');
describe('CSS token on manual svg dom node', () => {
    const URL = 'http://localhost:4567/lwc-dom-mode-manual-svg';

    before(() => {
        browser.url(URL);
    });

    it('should have token', () => {

        const elm = browser.execute(function () {
            return document.querySelector('integration-lwc-dom-mode-manual-svg').shadowRoot.querySelector('g');
        });

        browser.waitUntil(() => {
            return elm.getAttribute('integration-lwc-dom-mode-manual-svg_lwc-dom-mode-manual-svg') === '';
        }, 500, '<g> should have css token');

    });
});
