import { createElement } from 'lwc';

// TODO [#1869]: getting the global API from global LWC in tests until it is allowed in compiler
const { swapComponent } = LWC;

import Container from 'base/container';
import A from 'base/a';
import B from 'base/b';
import C from 'base/c';
import D from 'base/d';
import E from 'base/e';

describe('component swapping', () => {
    it('should work before and after instantiation', () => {
        expect(swapComponent(A, B)).toBe(true);
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.firstChild.shadowRoot.firstChild.outerHTML).toBe(
            '<p class="b">b</p>'
        );
        expect(swapComponent(B, C)).toBe(true);
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.firstChild.shadowRoot.firstChild.outerHTML).toBe(
                '<p class="c">c</p>'
            );
        });
    });

    it('should return false for root elements', () => {
        const elm = createElement('x-d', { is: D });
        document.body.appendChild(elm);
        expect(swapComponent(D, E)).toBe(false); // meaning you can reload the page
    });
});
