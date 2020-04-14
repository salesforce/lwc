/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/related-target';

function getRootEvents() {
    return browser.execute(function () {
        return document.querySelector('integration-related-target').getEvents();
    }).value;
}
function getRootInput() {
    return browser.$(function () {
        return document
            .querySelector('integration-related-target')
            .shadowRoot.querySelector('input');
    });
}

function getChildEvents() {
    return browser.execute(function () {
        return document
            .querySelector('integration-related-target')
            .shadowRoot.querySelector('integration-parent')
            .shadowRoot.querySelector('integration-child')
            .getEvents();
    }).value;
}
function getChildInput() {
    return browser.$(function () {
        return document
            .querySelector('integration-related-target')
            .shadowRoot.querySelector('integration-parent')
            .shadowRoot.querySelector('integration-child')
            .shadowRoot.querySelector('input');
    });
}

// FocusEvent.relatedTarget is always null in IE11
if (process.env.COMPAT === 'false') {
    describe('relatedTarget', () => {
        beforeEach(() => {
            browser.url(URL);
        });

        describe('when focus moves downwards in a shadow tree', () => {
            it('should retarget for blur', function () {
                getRootInput().click();
                getChildInput().click();

                const event = getRootEvents().pop();
                const { type, relatedTarget } = event;
                assert.strictEqual(`${type},${relatedTarget}`, 'blur,INTEGRATION-PARENT');
            });

            it('should not retarget for focus', function () {
                getRootInput().click();
                getChildInput().click();

                const event = getChildEvents().pop();
                const { type, relatedTarget } = event;
                assert.strictEqual(`${type},${relatedTarget}`, 'focus,INPUT');
            });
        });

        describe('when focus moves upwards in a shadow tree', () => {
            it('should retarget for focus', function () {
                getChildInput().click();
                getRootInput().click();

                const event = getRootEvents().pop();
                const { type, relatedTarget } = event;
                assert.strictEqual(`${type},${relatedTarget}`, 'focus,INTEGRATION-PARENT');
            });

            it('should not retarget for blur', function () {
                getChildInput().click();
                getRootInput().click();

                const event = getChildEvents().pop();
                const { type, relatedTarget } = event;
                assert.strictEqual(`${type},${relatedTarget}`, 'blur,INPUT');
            });
        });

        it('should be `undefined` if the event lacks a relatedTarget getter', () => {
            const relatedTarget = browser.execute(function () {
                var relatedTarget = null;
                var container = document.querySelector('integration-related-target');
                container.addEventListener('foo', function (event) {
                    relatedTarget = event.relatedTarget;
                });
                container.dispatchEvent(new CustomEvent('foo'));
                return String(relatedTarget);
            }).value;

            assert.strictEqual(relatedTarget, 'undefined');
        });
    });
}
