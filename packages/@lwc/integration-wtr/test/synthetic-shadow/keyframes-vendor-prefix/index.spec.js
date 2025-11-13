import { createElement } from 'lwc';
import A from 'x/a';

describe('keyframes with vendor prefix', () => {
    it('animation applies to element with local vendor-prefixed keyframes', () => {
        const el = createElement('x-a', { is: A });
        document.body.appendChild(el);

        const div = el.shadowRoot.querySelector('div');

        // if the div is actually animating, then its opacity will be between 0 and 0.9
        expect(parseFloat(getComputedStyle(div).opacity)).toBeLessThan(1);
    });
});
