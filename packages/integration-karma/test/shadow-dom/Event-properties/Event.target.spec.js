import { createElement } from 'lwc';
import XAsyncEventTarget from 'x/asyncEventTarget';

describe('Async event target', () => {
    let elm;
    beforeAll(() => {
        elm = createElement('x-async-event-target', { is: XAsyncEventTarget });
        document.body.appendChild(elm);
    });

    it('should be root node', function() {
        const triggerElm = elm.shadowRoot.querySelector('x-child');
        triggerElm.click();
        expect(elm.syncTargetIsCorrect).toBe(true);
        return new Promise(resolve => {
            setTimeout(resolve);
        }).then(() => {
            expect(elm.asyncTargetIsCorrect).toBe(true);
        });
    });
});
