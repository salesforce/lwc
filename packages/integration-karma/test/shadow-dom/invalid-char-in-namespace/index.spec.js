import { createElement } from 'lwc';
import ComponentAtX from '@x/component';
import ComponentXHashY from 'x#y/component';

describe('invalid character @ in namespace', () => {
    let elm;
    beforeEach(() => {
        elm = createElement('x-component', { is: ComponentAtX });
        document.body.appendChild(elm);
    });

    it('element renders despite invalid char in namespace', () => {
        const h1 = elm.shadowRoot.querySelector('h1');
        expect(h1.textContent).toEqual('Hello world');
        expect(getComputedStyle(h1).color).toEqual('rgb(0, 128, 0)');
    });
});

describe('invalid character # in namespace', () => {
    let elm;
    beforeEach(() => {
        elm = createElement('xy-component', { is: ComponentXHashY });
        document.body.appendChild(elm);
    });

    it('element renders despite invalid char in namespace', () => {
        const h1 = elm.shadowRoot.querySelector('h1');
        expect(h1.textContent).toEqual('Hello world');
        expect(getComputedStyle(h1).color).toEqual('rgb(0, 128, 0)');
    });
});
