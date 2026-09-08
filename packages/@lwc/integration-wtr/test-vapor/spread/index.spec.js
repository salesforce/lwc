import { createElement } from 'lwc';
import Host from 'x/host';

describe('vapor: lwc:spread on element', () => {
    it('applies spread props as attributes/properties', () => {
        const elm = createElement('x-host', { is: Host });
        elm.spanProps = { title: 'hello', 'data-x': '7' };
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('.target');
        expect(div.getAttribute('title')).toBe('hello');
        expect(div.getAttribute('data-x')).toBe('7');
    });

    it('reactively updates when the spread object changes', () => {
        const elm = createElement('x-host', { is: Host });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('.target');
        expect(div.getAttribute('title')).toBe('hi');
        elm.spanProps = { title: 'changed' };
        expect(div.getAttribute('title')).toBe('changed');
    });
});
