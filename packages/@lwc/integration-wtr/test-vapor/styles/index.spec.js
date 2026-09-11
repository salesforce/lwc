import { createElement } from 'lwc';
import Styled from 'x/styled';

describe('vapor: scoped styles', () => {
    it('injects the component stylesheet into the shadow root', () => {
        const elm = createElement('x-styled', { is: Styled });
        document.body.appendChild(elm);
        const p = elm.shadowRoot.querySelector('.msg');
        const color = getComputedStyle(p).color;
        expect(color).toBe('rgb(0, 128, 0)');
    });
});
