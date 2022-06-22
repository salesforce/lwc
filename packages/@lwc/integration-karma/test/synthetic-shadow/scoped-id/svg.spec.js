import { createElement } from 'lwc';

import SVG from 'x/svg';

describe('svg element', () => {
    it('should preserve relationship between graphical objects and their references (href)', () => {
        const elm = createElement('x-svg', { is: SVG });
        document.body.appendChild(elm);

        const href = elm.shadowRoot.querySelector('.blk-circle-use').getAttribute('href');
        const id = elm.shadowRoot.querySelector('.blk-circle').getAttribute('id');
        expect(href).toBe(`#${id}`);
    });

    it('should preserve relationship between graphical objects and their references (xlink:href)', () => {
        const elm = createElement('x-svg', { is: SVG });
        document.body.appendChild(elm);

        const href = elm.shadowRoot.querySelector('.red-circle-use').getAttribute('xlink:href');
        const id = elm.shadowRoot.querySelector('.red-circle').getAttribute('id');
        expect(href).toBe(`#${id}`);
    });
});
