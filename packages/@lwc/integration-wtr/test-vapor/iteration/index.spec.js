import { createElement } from 'lwc';
import List from 'x/list';

const items = (...names) => names.map((name, i) => ({ id: i + 1, name }));

describe('vapor: list rendering (for:each)', () => {
    it('renders a list of items inside a static parent', () => {
        const elm = createElement('x-list', { is: List });
        elm.items = items('apple', 'banana', 'cherry');
        document.body.appendChild(elm);
        const lis = elm.shadowRoot.querySelectorAll('ul > li');
        expect(lis.length).toBe(3);
        expect(lis[0].textContent).toBe('apple');
        expect(lis[2].textContent).toBe('cherry');
    });

    it('renders an empty list', () => {
        const elm = createElement('x-list', { is: List });
        elm.items = [];
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelectorAll('li').length).toBe(0);
    });

    // Post-mount list reconciles are async/batched (engine-core parity — a `for:each`
    // mutation applies on the next microtask), so assertions after a post-mount change
    // `await Promise.resolve()` first.
    it('grows the list reactively', async () => {
        const elm = createElement('x-list', { is: List });
        elm.items = items('a');
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelectorAll('li').length).toBe(1);

        elm.items = items('a', 'b', 'c', 'd');
        await Promise.resolve();
        expect(elm.shadowRoot.querySelectorAll('li').length).toBe(4);
    });

    it('shrinks the list reactively', async () => {
        const elm = createElement('x-list', { is: List });
        elm.items = items('a', 'b', 'c');
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelectorAll('li').length).toBe(3);

        elm.items = items('a');
        await Promise.resolve();
        expect(elm.shadowRoot.querySelectorAll('li').length).toBe(1);
        expect(elm.shadowRoot.querySelector('li').textContent).toBe('a');
    });
});
