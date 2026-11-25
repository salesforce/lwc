import { createElement } from 'lwc';
import Component from 'x/component';
import { resetDOM } from '../../../helpers/reset.js';

describe('dynamic text rendering', () => {
    afterEach(() => {
        resetDOM();
    });

    it('renders object with null prototype without throwing', () => {
        const elm = createElement('x-component', { is: Component });
        elm.value = Object.create(null);
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').textContent).toBe('[object Object]');
    });

    it('renders standard object as [object Object]', () => {
        const elm = createElement('x-component', { is: Component });
        elm.value = {};
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').textContent).toBe('[object Object]');
    });

    it('renders primitives correctly', () => {
        const elm = createElement('x-component', { is: Component });
        elm.value = 'hello';
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').textContent).toBe('hello');
    });

    it('renders null and undefined as empty string', () => {
        const elm = createElement('x-component', { is: Component });
        elm.value = null;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').textContent).toBe('');
    });
});
