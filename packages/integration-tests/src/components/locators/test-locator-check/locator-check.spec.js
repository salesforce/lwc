/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
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
        browser.execute(function() {
            document
                .querySelector('integration-locator-check')
                .shadowRoot.querySelector('integration-container')
                .shadowRoot.querySelector('integration-root')
                .shadowRoot.querySelector('.simple-locator')
                .click();
        });
        const clicked = browser.execute(function() {
            return window.clicked;
        }).value;
        const interaction = browser.execute(function() {
            return window.interaction;
        }).value;

        assert.equal(clicked, true);
        assert.deepStrictEqual(interaction, {
            target: 'root',
            scope: 'root-container',
            context: {
                'key-foo': 'from-root-2',
                'key-parent': 'from-container-1',
                'key-common': 'from-container-2',
            },
        });
    });

    it('locator logged on button click inside slot', () => {
        browser.execute(function() {
            document
                .querySelector('integration-locator-check')
                .shadowRoot.querySelector('integration-container')
                .shadowRoot.querySelector('.button-in-slot')
                .click();
        });
        const clicked = browser.execute(function() {
            return window.clicked;
        }).value;
        const interaction = browser.execute(function() {
            return window.interaction;
        }).value;

        assert.equal(clicked, true);
        assert.deepStrictEqual(interaction, {
            target: 'slot-in-container',
            scope: 'container-parent',
            context: {
                'key-slot': 'from-container-3',
                'container-parent': 'from-locator-check-1',
            },
        });
    });

    it('locator logged clicking on iteration item', () => {
        browser.execute(function() {
            document
                .querySelector('integration-locator-check')
                .shadowRoot.querySelector('integration-container')
                .shadowRoot.querySelector('integration-root')
                .shadowRoot.querySelector('.todo-item')
                .click();
        });
        const clicked = browser.execute(function() {
            return window.clicked;
        }).value;
        const interaction = browser.execute(function() {
            return window.interaction;
        }).value;

        assert.equal(clicked, true);
        assert.deepStrictEqual(interaction, {
            target: 'todo-item',
            scope: 'root-container',
            context: {
                'key-root': 'from-root-1',
                'key-common': 'from-container-2',
                'key-parent': 'from-container-1',
            },
        });
    });
});
