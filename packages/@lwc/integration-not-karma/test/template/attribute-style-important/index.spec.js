import { createElement } from 'lwc';

import Component from 'x/component';

describe('important style attribute', () => {
    it('renders important styles correctly', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('div');

        expect(getComputedStyle(target).color).toEqual('rgb(0, 0, 255)');
        expect(getComputedStyle(target).opacity).toEqual('0.5');
        expect(getComputedStyle(target).backgroundColor).toEqual('rgb(255, 0, 0)');
    });
});
