import { createElement } from 'test-utils';

import SVG from 'x/svg';
import Test from 'x/test';

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

describe('anchor element', () => {
    it('should not transform href that are assigned full urls', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const actual = elm.shadowRoot.querySelector('.salesforce-href').getAttribute('href');
        expect(actual).toBe('https://www.salesforce.com/jp/');
    });

    it('should not transform xlink:href even if they are assigned fragment only urls', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const actual = elm.shadowRoot.querySelector('.xlink-href').getAttribute('xlink:href');
        expect(actual).toBe('#foo');
    });

    it('should transform href that are assigned fragment only urls', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const href = elm.shadowRoot.querySelector('.section-1-href').getAttribute('href');
        const id = elm.shadowRoot.querySelector('.section-1-id').getAttribute('id');
        expect(href).toBe(`#${id}`);
    });
});

describe('area element', () => {
    it('should transform href that are assigned fragment only urls', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const href = elm.shadowRoot.querySelector('.section-2-href').getAttribute('href');
        const id = elm.shadowRoot.querySelector('.section-2-id').getAttribute('id');
        expect(href).toBe(`#${id}`);
    });
});
