const assert = require('assert');

describe('Locator Check', () => {
    const URL = 'http://localhost:4567/locator-check';

    before(() => {
        browser.url(URL);
    });

    beforeEach(() => {
        browser.execute(function() {
            window.clicked = undefined;
            window.interaction = undefined;
        });
    });

    it('locator logged on simple button click', () => {
        const button = browser.element(".simple-locator");
        button.click();
        const clicked = browser.execute(function() {
            return window.clicked;
        }).value;
        const interaction = browser.execute(function() {
            return window.interaction;
        }).value;

        assert.equal(clicked, true);
        assert.deepStrictEqual(interaction, {
            "target": "root",
            "scope": "root-container",
            "context": {
              "key-foo": "from-root-2",
              "key-parent": "from-container-1",
              "key-common": "from-container-2"
            }
          });
    });

    it('locator logged on button click inside slot', () => {
        const button = browser.element(".button-in-slot");
        button.click();
        const clicked = browser.execute(function() {
            return window.clicked;
        }).value;
        const interaction = browser.execute(function() {
            return window.interaction;
        }).value;

        assert.equal(clicked, true);
        assert.deepStrictEqual(interaction, {
            "target": "slot-in-container",
            "scope": "container-parent",
            "context": {
              "key-slot": "from-container-3",
              "container-parent": "from-locator-check-1"
            }
        });
    });

    it('locator logged clicking on iteration item', () => {
        const button = browser.element(".todo-item");
        button.click();
        const clicked = browser.execute(function() {
            return window.clicked;
        }).value;
        const interaction = browser.execute(function() {
            return window.interaction;
        }).value;

        assert.equal(clicked, true);
        assert.deepStrictEqual(interaction, {
            "target": "todo-item",
            "scope": "root-container",
            "context": {
              "key-root": "from-root-1",
              "key-common": "from-container-2",
              "key-parent": "from-container-1"
            }
          });
    });
});
