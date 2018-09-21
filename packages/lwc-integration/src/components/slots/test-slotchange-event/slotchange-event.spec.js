const assert = require('assert');

const URL = 'http://localhost:4567/slotchange-event';

function getEvents() {
    return document
        .querySelector('integration-slotchange-event')
        .events;
}

function getSlotNames() {
    return document
        .querySelector('integration-slotchange-event')
        .events
        .map(function (event) {
            return event.name;
        });
}

function getLeakedSlotChangeEvents() {
    return document
        .querySelector('integration-slotchange-event')
        .leakedSlotChangeEvents;
}

describe('slotchange', () => {
    it('should not be composed', () => {
        browser.url(URL);
        const leakedSlotChangeEvents = browser.execute(getLeakedSlotChangeEvents).value;
        assert.strictEqual(leakedSlotChangeEvents.length, 0);
    });

    describe('when initially rendered', () => {
        before(() => {
            browser.url(URL);
        });

        it('should be dispatched if a slotchange listener has been added to the slot', () => {
            const slotNames = browser.execute(getSlotNames).value;
            assert(slotNames.includes('default'));
        });

        it('should not be dispatched unless a slotchange listener has been added to the slot', () => {
            const slotNames = browser.execute(getSlotNames).value;
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
            assert.strictEqual(event.elements.length, 0, 'should have no assigned nodes');
        });

        it('should be dispatched when adding an assigned node', () => {
            browser.click('.foo-bar');
            const events = browser.execute(getEvents).value;
            const event = events.pop();
            assert.strictEqual(event.elements.join('.'), 'foo.bar', 'should have added an assigned node');
        });

        it('should be dispatched when replacing a single existing node with two different nodes', () => {
            browser.click('.countries');
            const events = browser.execute(getEvents).value;
            const event = events.pop();
            assert.strictEqual(event.elements.join('.'), 'belarus.china.cuba.france.india.japan.spain');
        });
    });

    describe('when adding listener programmatically', () => {
        before(() => {
            browser.url(URL);
        });

        it('should be dispatched if a slotchange listener has been dynamically added to the slot', () => {
            browser.execute(() => {
                const el = document.querySelector('integration-slotchange-event');
                el.addEventListenerToSlot();
                el.toggle();
            });
            const slotNames = browser.execute(getSlotNames).value;
            assert(slotNames.includes('programmatic-listener'));
        });
    });
});
