import { createElement } from 'lwc';
import XAsyncEventCurrentTarget from 'x/asyncEventCurrentTarget';

describe('Async event currentTarget', () => {
    let elm;
    beforeAll(() => {
        elm = createElement('x-async-event-current-target', { is: XAsyncEventCurrentTarget });
        document.body.appendChild(elm);
    });

    it('should be null', function() {
        const triggerElm = elm.shadowRoot.querySelector('div.triggerEventHandler');
        triggerElm.click();
        return new Promise(resolve => {
            setTimeout(resolve);
        }).then(() => {
            const conditionalChild = elm.shadowRoot.querySelector('.current-target-is-null');
            expect(conditionalChild).not.toBe(null);
        });
    });
});
