describe('Manually adding elements with children', () => {
    const URL = 'http://localhost:4567/lwc-dom-mode-manual-sync-node-remove';

    before(() => {
        browser.url(URL);
    });

    it('should not error when manually inserting a native element', () => {
        const button = browser.execute(function () {
            return document.querySelector('integration-lwc-dom-mode-manual-sync-node-remove').shadowRoot.querySelector('button');
        })
        button.click();

        const errorElm = browser.execute(function () {
            return document.querySelector('integration-lwc-dom-mode-manual-sync-node-remove').shadowRoot.querySelector('.error');
        });
        browser.waitUntil(() => {
            return errorElm.getText() === 'No error';
        }, 1000, 'Manually adding elements with children should not error');
    });

    it('should not error when manually inserting a custom element', () => {
        const button = browser.execute(function () {
            return document.querySelector('integration-lwc-dom-mode-manual-sync-node-remove').shadowRoot.querySelector('.insert-custom-element');
        })
        button.click();

        const errorElm = browser.execute(function () {
            return document.querySelector('integration-lwc-dom-mode-manual-sync-node-remove').shadowRoot.querySelector('.custome-element-error');
        });
        browser.waitUntil(() => {
            return errorElm.getText() === 'No error';
        }, 1000, 'Manually adding elements with children should not error');
    });
});
