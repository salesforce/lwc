const assert = require('assert');

const URL = 'http://localhost:4567/slotchange-event';

function getSlotNames() {
    return document
        .querySelector('integration-slotchange-event')
        .events
        .map(event => event.name);
}

describe('slotchange:', () => {

    describe('when initially rendered', () => {
        before(() => {
            browser.url(URL);
        });

        it('should not be dispatched unless a slotchange listener has been added to the slot', () => {
            const slotNames = browser.execute(getSlotNames).value;
            assert(!slotNames.includes('nochange'));
        });

        it('should be dispatched if a slotchange listener has been added to the slot', () => {
            const slotNames = browser.execute(getSlotNames).value;
            assert(slotNames.includes('yeschange'));
        });
    });

    describe('when adding listener programmatically', () => {
        before(() => {
            browser.url(URL);
        });

        it('should be dispatched if a slotchange listener has been dynamically added to the slot', () => {
            // This test fails when the assigned element uses an element with the same tag name.
            browser.execute(() => {
                const parent = document.querySelector('integration-parent');
                parent.addEventListenerToSlot();
                parent.toggleAssignedElement();
            });
            const slotNames = browser.execute(getSlotNames).value;
            assert(slotNames.includes('nochange'));
        });
    });
});