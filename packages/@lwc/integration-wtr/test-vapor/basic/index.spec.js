import { createElement } from 'lwc';
import Counter from 'x/counter';

describe('vapor: basic component', () => {
    it('renders initial reactive text', () => {
        const elm = createElement('x-counter', { is: Counter });
        document.body.appendChild(elm);
        const button = elm.shadowRoot.querySelector('button');
        expect(button.textContent).toBe('Count: 0');
    });

    it('updates reactively on event-driven @track mutation', () => {
        const elm = createElement('x-counter', { is: Counter });
        document.body.appendChild(elm);
        const button = elm.shadowRoot.querySelector('button');
        button.click();
        expect(button.textContent).toBe('Count: 1');
        button.click();
        expect(button.textContent).toBe('Count: 2');
    });

    it('reflects @api prop changes through a computed getter', () => {
        const elm = createElement('x-counter', { is: Counter });
        elm.startLabel = 'Total';
        document.body.appendChild(elm);
        const button = elm.shadowRoot.querySelector('button');
        expect(button.textContent).toBe('Total: 0');
    });
});
