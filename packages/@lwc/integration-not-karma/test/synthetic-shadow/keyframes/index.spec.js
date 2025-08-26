import { createElement } from 'lwc';
import A from 'x/a';
import B from 'x/b';

describe('keyframes', () => {
    it('animation applies to element with local keyframes', () => {
        const el = createElement('x-a', { is: A });
        document.body.appendChild(el);

        const div = el.shadowRoot.querySelector('div');

        // if the div is actually animating, then its opacity will be between 0 and 0.9
        expect(parseFloat(getComputedStyle(div).opacity)).toBeLessThan(1);
    });

    it('animation does not apply to element with keyframes from outside element', () => {
        const el = createElement('x-b', { is: B });
        document.body.appendChild(el);

        const div = el.shadowRoot.querySelector('div');

        expect(parseFloat(getComputedStyle(div).opacity)).toEqual(1);
    });
});
