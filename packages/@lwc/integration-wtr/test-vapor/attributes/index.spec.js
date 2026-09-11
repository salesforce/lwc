import { createElement } from 'lwc';
import Attrs from 'x/attrs';

describe('vapor: dynamic class and attribute bindings', () => {
    it('renders initial class and attribute values', () => {
        const elm = createElement('x-attrs', { is: Attrs });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('div');
        expect(div.className).toBe('initial');
        expect(div.getAttribute('title')).toBe('hello');
    });

    it('reactively updates the class binding', () => {
        const elm = createElement('x-attrs', { is: Attrs });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('div');

        elm.cssClass = 'updated';
        expect(div.className).toBe('updated');
    });

    it('reactively updates the attribute binding', () => {
        const elm = createElement('x-attrs', { is: Attrs });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('div');

        elm.titleText = 'world';
        expect(div.getAttribute('title')).toBe('world');
    });
});
