/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Setting AOM property on anchor tag', () => {
    const URL = 'http://localhost:4567/active-element';
    let element;

    before(() => {
        browser.url(URL);
    });

    describe('Focusing on input inside child', () => {
        it('should have correct document.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.nested-input').focus();
                return document.activeElement;
            });
            assert.equal(elm.getTagName(), 'integration-active-element');
        });

        it('should have correct integration-parent.shadowRoot.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.nested-input').focus();
                return document.querySelector('integration-parent').shadowRoot.activeElement;
            });
            assert.equal(elm.getTagName(), 'integration-child');
        });

        it('should have correct integration-child.shadowRoot.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.nested-input').focus();
                return document.querySelector('integration-child').shadowRoot.activeElement;
            });
            assert.equal(elm.getTagName(), 'input');
        });
    });

    describe('Focusing on button inside parent', () => {
        it('should have correct document.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('button').focus();
                return document.activeElement;
            });
            assert.equal(elm.getTagName(), 'integration-active-element');
        });

        it('should have correct integration-parent.shadowRoot.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('button').focus();
                return document.querySelector('integration-parent').shadowRoot.activeElement;
            });
            assert.equal(elm.getTagName(), 'button');
        });

        it('should have correct button value', () => {
            const elm = browser.execute(function () {
                document.querySelector('button').focus();
                return document.querySelector('integration-child').shadowRoot.activeElement;
            });
            assert.equal(elm.value, null);
        });
    });

    describe('Focusing on input outside of LWC tree', () => {
        it('should have correct document.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.outside-input').focus();
                return document.activeElement;
            });
            assert.equal(elm.getTagName(), 'input');
        });

        it('should have correct integration-parent.shadowRoot.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.outside-input').focus();
                return document.querySelector('integration-parent').shadowRoot.activeElement;
            });
            assert.equal(elm.value, null);
        });

        it('should have correct button value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.outside-input').focus();
                return document.querySelector('integration-child').shadowRoot.activeElement;
            });
            assert.equal(elm.value, null);
        });
    });

    describe('Focusing on input that is slotted', () => {
        it('should have correct document.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.slotted').focus();
                return document.activeElement;
            });
            assert.equal(elm.getTagName(), 'integration-active-element');
        });

        it('should have correct active-element.shadowRoot.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.slotted').focus();
                return document.querySelector('integration-active-element').shadowRoot.activeElement;
            });
            assert.equal(elm.getTagName(), 'input');
        });

        it('should have correct integration-parent.shadowRoot.activeElement value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.slotted').focus();
                return document.querySelector('integration-parent').shadowRoot.activeElement;
            });
            assert.equal(elm.value, null);
        });

        it('should have correct button value', () => {
            const elm = browser.execute(function () {
                document.querySelector('.slotted').focus();
                return document.querySelector('integration-child').shadowRoot.activeElement;
            });
            assert.equal(elm.value, null);
        });
    });
});
