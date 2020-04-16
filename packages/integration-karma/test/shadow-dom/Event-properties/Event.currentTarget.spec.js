import { createElement } from 'lwc';
import XAsyncEventCurrentTarget from 'x/asyncEventCurrentTarget';

it('Async event currentTarget should be null', function () {
    const elm = createElement('x-async-event-current-target', { is: XAsyncEventCurrentTarget });
    document.body.appendChild(elm);
    const triggerElm = elm.shadowRoot.querySelector('div.triggerEventHandler');
    triggerElm.click();
    return new Promise(setTimeout).then(() => {
        const conditionalChild = elm.shadowRoot.querySelector('.current-target-is-null');
        expect(conditionalChild).not.toBe(null);
    });
});
