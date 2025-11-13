import { createElement, swapComponent } from 'lwc';

import Container from 'base/container';
import A from 'base/a';
import B from 'base/b';
import C from 'base/c';
import D from 'base/d';
import E from 'base/e';
import X from 'base/libraryx';
import Z from 'base/libraryz';

// Swapping is only enabled in dev mode
describe.skipIf(process.env.NODE_ENV === 'production')('component swapping', () => {
    it('should work before and after instantiation', async () => {
        expect(swapComponent(A, B)).toBe(true);
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.firstChild.shadowRoot.firstChild.outerHTML).toBe(
            '<p class="b">b</p>'
        );
        expect(swapComponent(B, C)).toBe(true);
        await Promise.resolve();
        expect(elm.shadowRoot.firstChild.shadowRoot.firstChild.outerHTML).toBe(
            '<p class="c">c</p>'
        );
    });

    it('should return false for root elements', () => {
        const elm = createElement('x-d', { is: D });
        document.body.appendChild(elm);
        expect(swapComponent(D, E)).toBe(false); // meaning you can reload the page
    });

    it('should throw for invalid old component', () => {
        expect(() => {
            swapComponent(function () {}, D);
        }).toThrowError(
            TypeError,
            /Invalid Component: Attempting to swap a non-component with a component/
        );
    });

    it('should throw for invalid new componeont', () => {
        expect(() => {
            swapComponent(D, function () {});
        }).toThrowError(
            TypeError,
            /Invalid Component: Attempting to swap a component with a non-component/
        );
    });

    it('should be a no-op for non components', async () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        expect(elm.testValue).toBe('I may look like a component');
        expect(swapComponent(Z, X)).toBe(false);
        await Promise.resolve();
        expect(elm.testValue).toBe('I may look like a component');
    });
});
