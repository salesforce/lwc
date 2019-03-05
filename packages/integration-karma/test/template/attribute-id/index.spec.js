import { createElement } from 'test-utils';

import SVG from 'x/svg';
import Test from 'x/test';

describe('id/idref attributes', () => {
    it('should transform id attributes', () => {
        const elm = createElement('x-svg', { is: SVG });
        document.body.appendChild(elm);

        const actual = elm.shadowRoot.querySelector('.blk-circle').getAttribute('id');
        expect(actual).not.toBe('blk-circle');
        expect(actual).toContain('blk-circle');
    });

    describe('svg element', () => {
        it('should transform href attribute value', () => {
            const elm = createElement('x-svg', { is: SVG });
            document.body.appendChild(elm);

            const actual = elm.shadowRoot.querySelector('.blk-circle-use').getAttribute('href');
            expect(actual).not.toBe('#blk-circle');
            expect(actual).toContain('#blk-circle');
        });

        it('should transform xlink:href attribute value', () => {
            const elm = createElement('x-svg', { is: SVG });
            document.body.appendChild(elm);

            const actual = elm.shadowRoot
                .querySelector('.red-circle-use')
                .getAttribute('xlink:href');
            expect(actual).not.toBe('#red-circle');
            expect(actual).toContain('#red-circle');
        });
    });

    describe('a element', () => {
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

            const actual = elm.shadowRoot.querySelector('.section-1-href').getAttribute('href');
            expect(actual).not.toBe('#section-1');
            expect(actual).toContain('#section-1');
        });
    });

    describe('area element', () => {
        it('should transform href that are assigned fragment only urls', () => {
            const elm = createElement('x-test', { is: Test });
            document.body.appendChild(elm);

            const actual = elm.shadowRoot.querySelector('.section-2-href').getAttribute('href');
            expect(actual).not.toBe('#section-2');
            expect(actual).toContain('#section-2');
        });
    });
});
