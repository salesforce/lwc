const assert = require('assert');



describe('Testing component: compat-simple', () => {
    const COMPAT_SIMPLE_URL = 'http://localhost:4567/compat-simple';

    before(function () {
        browser.addCommand('getText', async function async (selector) {
            function elementText(element) {
                console.log('traversing', element);
                var text = '';
                var childNodes = element.childNodes;
                if (element.shadowRoot) {
                    childNodes = childNodes.concat(element.shadowRoot.childNodes);
                }

                var len = childNodes.length;

                for(var i = 0; i < len; i += 1) {
                    var node = childNodes[i];
                    var nodeType = node.nodeType;
                    if (nodeType === 1) {
                        text += elementText(node);
                    } else if (nodeType === 3) {
                        text += node.textContent;
                    }
                }
                return text;
            }

            return this.execute(function () {
                var element = document.querySelector('compat-simple');
                return elementText(element);
            });
        }, true);
    })

    it('page load', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const title = browser.getTitle();
        assert.equal(title, 'compat-simple');
    });

    it('render', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const element = browser.element('compat-simple');
        assert.ok(element);
        assert.equal(browser.getText('compat-simple'), 'default');
    });

    it('update text (involves method call)', () => {
        browser.url(COMPAT_SIMPLE_URL);
        const element = browser.element('compat-simple');
        assert.ok(element);

        browser.execute(function() {
            var el = document.querySelector('compat-simple');
            el.changeComputedText();
        });
        assert.equal(element.getText(), 'default#changed');
    });

});
