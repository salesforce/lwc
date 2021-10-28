import { createElement } from 'lwc';
import Component from '@x/component';

describe('invalid character in namespace', () => {
    let elm;
    beforeEach(() => {
        elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
    });

    it('element renders despite invalid char in namespace', () => {
        const h1 = elm.shadowRoot.querySelector('h1');
        expect(h1.textContent).toEqual('Hello world');
        expect(getComputedStyle(h1).color).toEqual('rgb(0, 128, 0)');
    });
});
