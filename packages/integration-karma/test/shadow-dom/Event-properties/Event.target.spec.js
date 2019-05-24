import { createElement } from 'lwc';
import XAsyncEventTarget from 'x/asyncEventTarget';
import XEventHandlingParent from 'x/eventHandlingParent';
import XDocumentEventListener from 'x/documentEventListener';

// The composed-event-click-polyfill doesn't work when native Shadow DOM is enabled on Safari 12.0.0 (it has been fixed
// with Safari 12.0.1). The polyfill only patches the event javascript wrapper and doesn't have any effect on how Webkit
// make the event bubbles.
// TODO: #XXX - Enable this test again once Sauce Labs supports Safari version >= 12.0.0
if (!process.env.NATIVE_SHADOW) {
    it('Async event target should be root node', function() {
        const elm = createElement('x-async-event-target', { is: XAsyncEventTarget });
        document.body.appendChild(elm);
        const triggerElm = elm.shadowRoot.querySelector('x-child');
        triggerElm.click();
        expect(elm.syncTargetIsCorrect).toBe(true);
        return new Promise(setTimeout).then(() => {
            expect(elm.asyncTargetIsCorrect).toBe(true);
        });
    });
}

it('parent should receive composed event with correct target', function() {
    const elm = createElement('x-parent', { is: XEventHandlingParent });
    document.body.appendChild(elm);
    const child = elm.shadowRoot.querySelector('x-event-dispatching-child');
    child.dispatchFoo();
    expect(elm.evtTargetIsXChild).toBe(true);
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.evt-target-is-x-child')).not.toBe(null);
    });
});

// The composed-event-click-polyfill doesn't work when native Shadow DOM is enabled on Safari 12.0.0 (it has been fixed
// with Safari 12.0.1). The polyfill only patches the event javascript wrapper and doesn't have any effect on how Webkit
// make the event bubbles.
// TODO: #XXX - Enable this test again once Sauce Labs supports Safari version >= 12.0.0
if (!process.env.NATIVE_SHADOW) {
    describe('event.target on document event listener', () => {
        let actual;
        const listener = evt => {
            actual = evt.target.tagName.toLowerCase();
        };
        beforeAll(() => {
            document.addEventListener('click', listener);
        });
        afterAll(() => {
            document.removeEventListener('click', listener);
        });
        it('should return correct target', function() {
            const elm = createElement('x-document-event-listener', { is: XDocumentEventListener });
            document.body.appendChild(elm);
            elm.shadowRoot.querySelector('button').click();
            expect(actual).toBe('x-document-event-listener');
        });
    });
}
