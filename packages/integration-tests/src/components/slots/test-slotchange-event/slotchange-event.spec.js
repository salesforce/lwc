/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = 'http://localhost:4567/slotchange-event';

function getEvents() {
    var messages = Array.prototype.slice.call(document.querySelectorAll('.message'));
    return messages
        .map(function(message) {
            return message.textContent;
        })
        .map(JSON.parse);
}

function getSlotNames(events) {
    return events.map(function(event) {
        return event.slotName;
    });
}

describe('slotchange', () => {
    it('should not be composed', () => {
        browser.url(URL);
        const el = browser.element('.leaked-slotchange-event-count');
        assert.strictEqual(el.getText(), '0');
    });

    describe('when initially rendered', () => {
        before(() => {
            browser.url(URL);
        });

        it('should be dispatched if a slotchange listener has been added to the slot', () => {
            const events = browser.execute(getEvents).value;
            const slotNames = getSlotNames(events);
            assert(slotNames.includes('default'));
        });

        it('should not be dispatched unless a slotchange listener has been added to the slot', () => {
            const events = browser.execute(getEvents).value;
            const slotNames = getSlotNames(events);
            assert(!slotNames.includes('programmatic-listener'));
        });
    });

    describe('when slot content is updated', () => {
        before(() => {
            browser.url(URL);
        });

        it('should be dispatched when removing an assigned node', () => {
            browser.click('.clear');
            const events = browser.execute(getEvents).value;
            const event = events.pop();
            assert.strictEqual(event.assignedContents.length, 0, 'should have no assigned nodes');
        });

        it('should be dispatched when adding an assigned node', () => {
            browser.click('.foo-bar');
            const events = browser.execute(getEvents).value;
            const event = events.pop();
            assert.strictEqual(
                event.assignedContents.join('.'),
                'foo.bar',
                'should have added an assigned node'
            );
        });

        it('should be dispatched when replacing a single existing node with two different nodes', () => {
            browser.click('.countries');
            const events = browser.execute(getEvents).value;
            const event = events.pop();
            assert.strictEqual(
                event.assignedContents.join('.'),
                'belarus.china.cuba.france.india.japan.spain'
            );
        });
    });

    describe('when slots are nested', () => {
        before(() => {
            browser.url(URL);
        });

        // Enable this test when we're ready to support nested slots.
        it.skip('should bubble up to the parent slot', () => {
            browser.click('.update-name');
            const events = browser.execute(getEvents).value;
            const event = events.pop();
            assert.strictEqual(event.slotName, 'full');
        });
        // Delete this test when we're ready to support nested slots.
        it('should not bubble up to the parent slot', () => {
            browser.click('.update-name');
            const events = browser.execute(getEvents).value;
            const event = events.pop();
            assert.notStrictEqual(event.slotName, 'full');
        });
    });

    describe('when adding listener programmatically', () => {
        before(() => {
            browser.url(URL);
        });

        // The following test asserts that slotchange is dispatched as expected
        // by first assigning content and then checking that the assigned
        // content was cleared. This is because the slotchange event.target does
        // not get patched due to the listener being added dynamically and
        // assignedNodes() is therefore unavailable.
        it('should be dispatched if a slotchange listener has been dynamically added to the slot', () => {
            browser.click('.countries');
            const initialEvents = browser.execute(getEvents).value;
            const initialSlotNames = getSlotNames(initialEvents);
            assert(
                initialSlotNames.join('.'),
                'belarus.china.cuba.france.india.japan.spain',
                'Assigned nodes have been initialized as expected.'
            );

            browser.click('.toggle-content');
            let events = browser.execute(getEvents).value;
            let slotNames = getSlotNames(events);
            assert(
                slotNames.join('.'),
                'belarus.china.cuba.france.india.japan.spain',
                'slotchange should not be dispatched.'
            );

            browser.click('.add-slotchange');
            browser.click('.toggle-content');
            events = browser.execute(getEvents).value;
            slotNames = getSlotNames(events);
            assert(slotNames.join('.'), '', 'slotchange should be dispatched.');
        });
    });
});
