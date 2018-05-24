const assert = require('assert');
const TEST_URL = 'http://localhost:4567/event-flow';

// Loaded from the browser context before each test
let EVENT;
let LOGGED_GUIDS;

function getLoggedEventGuids() {
    LOGGED_GUIDS = LOGGED_GUIDS || browser
        .execute(function () {
            return document.querySelector('event-flow').logs;
        })
        .value
        .map(event => event.guid);
    return LOGGED_GUIDS;
}

function getGuidIndex(eventGuid) {
    eventGuid = Number(eventGuid);
    const guids = getLoggedEventGuids();
    let foundIndex = -1;
    const filtered = guids
        .filter((guid, index) => {
            if (eventGuid === guid) {
                foundIndex = index;
            }
        });
    if (filtered.length > 1) {
        throw new Error('These tests are not reliable if the same event is logged more than once.');
    }
    if (foundIndex === -1) {
        throw new Error(`The guid "${eventGuid}" was not logged.`);
    }
    return foundIndex;
}

function clickSlottedButton() {
    browser.element('button#slotted').click();
}
function clickChildButton() {
    browser.element('button#child').click();
}

function isEventLogged(guid) {
    return getLoggedEventGuids().some(g => g === guid);
}

describe('event flow:', () => {
    before(() => {
        browser.url(TEST_URL);

        // Load the set of events from the event-flow component
        EVENT = browser.execute(function () {
            return document.querySelector('event-flow').EVENT;
        }).value;

        if (typeof Proxy !== 'undefined') {
            // For sanity, to guard against misspelled event names
            EVENT = new Proxy(EVENT, {
                get(target, property, receiver) {
                    const value = target[property];
                    if (typeof value === 'undefined') {
                        throw new Error(`The event "${property}" does not exist.`);
                    }
                    return value;
                }
            });
        }
    });

    beforeEach(() => {
        // One click per page load
        browser.url(TEST_URL);
        // Reset log cache
        LOGGED_GUIDS = null;
    });

    describe('when the child button is clicked', () => {
        describe('the parent shadow root listener', () => {
            it('should execute before the parent custom element listener bound from the inside', () => {
                clickChildButton();

                const shadowRootIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT
                );
                const customElementIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT
                );

                assert(shadowRootIndex < customElementIndex);
            });

            it('should execute before the parent custom element listener bound from the event-flow renderedCallback', () => {
                clickChildButton();

                const shadowRootIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT
                );
                const customElementIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT
                );

                assert(shadowRootIndex < customElementIndex);
            });

            it('should execute before the parent custom element listener bound from the event-flow template', () => {
                clickChildButton();

                const shadowRootIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT
                );
                const customElementIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT
                );

                assert(shadowRootIndex < customElementIndex);
            });
        });

        describe('the parent custom element listener bound from the inside', () => {
            it('should execute after the parent custom element listener programmatically bound from the outside', () => {
                clickChildButton();

                const insideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT
                );
                const outsideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT
                );

                assert(insideIndex < outsideIndex);
            });

            it('should execute after the parent custom element listener declaratively bound from the outside', () => {
                clickChildButton();

                const insideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT
                );
                const outsideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT
                );

                assert(insideIndex < outsideIndex);
            });
        });

        describe('the child shadow root listener', () => {
            it('should execute before the inside child custom element listener', () => {
                clickChildButton();

                const shadowRootIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT
                );
                const customElementIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD
                );

                assert(shadowRootIndex < customElementIndex);
            });

            it('should execute before the child custom element listener bound from the parent renderedCallback', () => {
                clickChildButton();

                const shadowRootIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT
                );
                const customElementIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD
                );

                assert(shadowRootIndex < customElementIndex);
            });

            it('should execute before the child custom element listener bound from the parent template', () => {
                clickChildButton();

                const shadowRootIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT
                );
                const customElementIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD
                );

                assert(shadowRootIndex < customElementIndex);
            });
        });

        describe('the child custom element listener bound from the inside', () => {
            it('should execute before the child custom element listener programmatically bound from the outside', () => {
                clickChildButton();

                const insideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD
                );
                const outsideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD
                );

                assert(insideIndex < outsideIndex);
            });

            it('should execute before the child custom element listener declaratively bound from the outside', () => {
                clickChildButton();

                const insideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD
                );
                const outsideIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD
                );

                assert(insideIndex < outsideIndex);
            });
        });

        describe('the parent shadow root listener bound in the constructor', () => {
            it('should execute before the parent shadow root listener bound in the renderedCallback', () => {
                clickChildButton();

                const constructorIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT
                );
                const renderedCallbackIndex = getGuidIndex(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT
                );

                assert(constructorIndex < renderedCallbackIndex);
            });
        });
    });

    describe('when the slotted button is clicked', () => {
        // TODO: Render slots in the DOM
        it.skip('the slotted button click listener bound to the slot in the child renderedCallback should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOT)
            );
        });

        it('the slotted button click listener bound to the slotted button in the parent renderedCallback should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOTTED_BUTTON)
            );
        });

        it('the slotted button click listener bound to the slotted button in the parent template should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_SLOTTED_BUTTON)
            );
        });

        it('the slotted button click listener bound to the child shadow root should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT)
            );
        });

        it('the slotted button click listener bound to the child custom element in the child constructor should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD)
            );
        });

        it('the slotted button click listener bound to the child custom element in the parent template should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD)
            );
        });

        it('the slotted button click listener bound to the child custom element in the parent renderedCallback should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD)
            );
        });

        it('the slotted button click listener bound to the div in the parent template should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV)
            );
        });

        it('the slotted button click listener bound to the div in the parent renderedCallback should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV)
            );
        });

        it('the slotted button click listener bound to the parent shadow root should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT)
            );
        });

        it('the slotted button click listener bound to the parent custom element should execute', () => {
            clickSlottedButton();
            assert(
                isEventLogged(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT)
            );
        });
    });
});
