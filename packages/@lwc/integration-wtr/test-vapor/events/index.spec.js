import { createElement } from 'lwc';
import Clicker from 'x/clicker';

describe('vapor: event handling', () => {
    it('handles delegated click events and updates bound text', () => {
        const elm = createElement('x-clicker', { is: Clicker });
        document.body.appendChild(elm);
        const output = elm.shadowRoot.querySelector('output');
        expect(output.textContent).toBe('0');

        elm.shadowRoot.querySelector('.inc').click();
        expect(output.textContent).toBe('1');
    });

    it('dispatches to the correct handler per element', () => {
        const elm = createElement('x-clicker', { is: Clicker });
        document.body.appendChild(elm);
        const output = elm.shadowRoot.querySelector('output');

        elm.shadowRoot.querySelector('.inc').click();
        elm.shadowRoot.querySelector('.inc').click();
        elm.shadowRoot.querySelector('.inc').click();
        expect(output.textContent).toBe('3');

        elm.shadowRoot.querySelector('.dec').click();
        expect(output.textContent).toBe('2');
    });
});
