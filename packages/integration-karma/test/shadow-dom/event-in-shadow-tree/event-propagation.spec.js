// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-inside-shadow-tree.html

import { createElement } from 'lwc';

import XParentWithDeclarativeHandlers from 'x/parentWithDeclarativeHandlers';

describe('event propagation in simple shadow tree', () => {
    describe('parent with declarative handlers', () => {
        let elm;
        let child;
        beforeAll(() => {
            elm = createElement('x-parent-with-declarative-handlers', {
                is: XParentWithDeclarativeHandlers,
            });
            document.body.appendChild(elm);
            child = elm.shadowRoot.querySelector('x-event-dispatching-child');
        });
        if (process.env.COMPAT !== true) {
            // https://github.com/salesforce/es5-proxy-compat/issues/115
            it('event handlers gets invoked when composed event is dispatched', () => {
                child.dispatchStandardEvent();
                expect(elm.eventReceived).toBe(true);
            });
        }

        it('event handlers gets invoked when composed custom event is dispatched', () => {
            child.dispatchCustomEvent();
            expect(elm.customEventReceived).toBe(true);
        });
    });
});
