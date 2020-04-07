import { createElement } from 'lwc';

import WireContextProvider from 'x/wireContextProvider';

describe('wirecontextevent', () => {
    it('should dispatchEvent on custom element when adapter dispatch an event of type wirecontextevent on the wireEventTarget', () => {
        const elm = createElement('x-wirecontext-provider', { is: WireContextProvider });
        elm.context = 'test value';

        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const consumer = elm.shadowRoot.querySelector('.consumer');

            expect(consumer.shadowRoot.textContent).toBe('test value');
        });
    });
});
