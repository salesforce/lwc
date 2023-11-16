/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/related-target';

function getEvents(elm) {
    return browser.execute(function (elm) {
        return elm.getEvents();
    }, elm);
}

async function getRootEvents() {
    const root = await browser.$('integration-related-target');
    return getEvents(root);
}
function getRootInput() {
    return browser.shadowDeep$('integration-related-target', 'input');
}

async function getChildEvents() {
    const child = await browser.shadowDeep$(
        'integration-related-target',
        'integration-parent',
        'integration-child'
    );
    return getEvents(child);
}

function getChildInput() {
    return browser.shadowDeep$(
        'integration-related-target',
        'integration-parent',
        'integration-child',
        'input'
    );
}

describe('relatedTarget', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    describe('when focus moves downwards in a shadow tree', () => {
        it('should retarget for blur', async () => {
            const rootInput = await getRootInput();
            await rootInput.click();
            const childInput = await getChildInput();
            await childInput.click();

            const events = await getRootEvents();
            const { type, relatedTarget } = events.pop();
            assert.strictEqual(`${type},${relatedTarget}`, 'blur,INTEGRATION-PARENT');
        });

        it('should not retarget for focus', async () => {
            const rootInput = await getRootInput();
            await rootInput.click();
            const childInput = await getChildInput();
            await childInput.click();

            const events = await getChildEvents();
            const { type, relatedTarget } = events.pop();
            assert.strictEqual(`${type},${relatedTarget}`, 'focus,INPUT');
        });
    });

    describe('when focus moves upwards in a shadow tree', () => {
        it('should retarget for focus', async () => {
            const childInput = await getChildInput();
            await childInput.click();
            const rootInput = await getRootInput();
            await rootInput.click();

            const events = await getRootEvents();
            const { type, relatedTarget } = events.pop();
            assert.strictEqual(`${type},${relatedTarget}`, 'focus,INTEGRATION-PARENT');
        });

        it('should not retarget for blur', async () => {
            const childInput = await getChildInput();
            await childInput.click();
            const rootInput = await getRootInput();
            await rootInput.click();

            const events = await getChildEvents();
            const { type, relatedTarget } = events.pop();
            assert.strictEqual(`${type},${relatedTarget}`, 'blur,INPUT');
        });
    });

    it('should be `undefined` if the event lacks a relatedTarget getter', async () => {
        const relatedTarget = await browser.execute(function () {
            var relatedTarget = null;
            var container = document.querySelector('integration-related-target');
            container.addEventListener('foo', function (event) {
                relatedTarget = event.relatedTarget;
            });
            container.dispatchEvent(new CustomEvent('foo'));
            return String(relatedTarget);
        }).value;

        assert.strictEqual(relatedTarget, undefined);
    });
});
