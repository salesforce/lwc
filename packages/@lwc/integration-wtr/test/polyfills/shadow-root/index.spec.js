import { createElement } from 'lwc';
import XTest from 'x/test';

it('should attach ShadowRoot to the global object if not present', () => {
    expect(typeof window.ShadowRoot).toBe('function');
    expect(String(window.ShadowRoot)).toMatch(/ShadowRoot|SyntheticShadowRoot/);
});

// See W-17585549 & W-17585571
it('should not use component implementation', () => {
    const elm = createElement('x-test', { is: XTest });
    document.body.appendChild(elm);
    expect(() => elm.compareHostElement()).not.toThrow();
    expect(() => elm.getHostElementRootNode()).not.toThrow();
});

describe('ShadowRoot.activeElement', () => {
    it('should be null when no active element is found', () => {
        const elm = createElement('x-parent', { is: XTest });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.activeElement).toBe(null);
    });

    it('should be null when no element in the shadow has focus', () => {
        const elm = createElement('x-parent', { is: XTest });
        const outsideInput = document.createElement('input');
        document.body.appendChild(elm);
        document.body.appendChild(outsideInput);
        outsideInput.focus();
        expect(elm.shadowRoot.activeElement).toBe(null);
        expect(document.activeElement).toBe(outsideInput);
    });

    it('should reference an element in the shadow when that element has focus', () => {
        const elm = createElement('x-parent', { is: XTest });
        document.body.appendChild(elm);
        const input = elm.shadowRoot.querySelector('input');
        input.focus();
        expect(elm.shadowRoot.activeElement).toBe(input);
    });
});
