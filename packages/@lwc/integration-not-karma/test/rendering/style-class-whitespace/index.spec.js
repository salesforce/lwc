import { createElement } from 'lwc';
import Component from 'c/component';

describe('style and class whitespace normalization', () => {
    it('should normalize style whitespace', async () => {
        const elm = createElement('c-component', { is: Component });
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
    it('should normalize class whitespace', async () => {
        const elm = createElement('c-component', { is: Component });
        document.body.appendChild(elm);
        await Promise.resolve();

        const actual = [...elm.shadowRoot.querySelectorAll('[class]')].map((elm) =>
            elm.getAttribute('class')
        );
        expect(actual).toEqual([
            'boo',
            'boo',
            'foo bar',
            'foo bar baz',
            'foo bar',
            'foo bar',
            'foo bar',
            'foo bar',
        ]);
    });
});
