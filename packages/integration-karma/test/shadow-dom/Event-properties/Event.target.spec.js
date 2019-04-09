import { createElement } from 'lwc';
import XAsyncEventTarget from 'x/asyncEventTarget';
import XEventHandlingParent from 'x/eventHandlingParent';

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
