import { createElement } from 'lwc';
import Component from 'x/component';

describe('whitespace normalization for style attribute', () => {
    it('should render !important styles correctly', async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        await Promise.resolve();
        const actual = [...elm.shadowRoot.querySelectorAll('[style]')].map((elm) =>
            elm.getAttribute('style')
        );
        expect(actual).toEqual([
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red !important;',
            'color: red;',
            'color: red; background-color: aqua;',
            'color: red; background-color: aqua;',
            '--its-a-tab: red;',
            '--its-a-tab-and-a-space: red;',
        ]);
    });
});
