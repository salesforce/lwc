import { createElement } from 'test-utils';
import XObjectEntries from 'x/objectEntries';

let shadowRoot;
beforeAll(() => {
    const elm = createElement('x-object-entries', { is: XObjectEntries });
    document.body.appendChild(elm);
    shadowRoot = elm.shadowRoot;
});

describe('Plain Object', () => {
    it('should return proper value for simple object', () => {
        const element = shadowRoot.querySelector('.simple');
        expect(element.textContent).toBe('x,x|y,42');
    });

    it('should return proper value for array-like object', () => {
        const element = shadowRoot.querySelector('.array-like');
        expect(element.textContent).toBe('0,a|1,b|2,c');
    });

    it('should return ordered keys', () => {
        const element = shadowRoot.querySelector('.unordered');
        expect(element.textContent).toBe('2,b|7,c|100,a');
    });

    it('should omit not-enumerable properties', () => {
        const element = shadowRoot.querySelector('.not-enumerable');
        expect(element.textContent).toBe('z,z');
    });

    it('should handle non-object values', () => {
        const element = shadowRoot.querySelector('.non-object');
        expect(element.textContent).toBe('0,f|1,o|2,o');
    });

    it('should omit symbol properties', () => {
        const element = shadowRoot.querySelector('.symbol');
        expect(element.textContent).toBe('x,x|y,42');
    });

    it('should support iterable protocol', () => {
        const element = shadowRoot.querySelector('.iterable');
        expect(element.textContent).toBe('[x:x][y:42]');
    });

    it('should support array operations', () => {
        const element = shadowRoot.querySelector('.array-operation');
        expect(element.textContent).toBe('[x:x][y:42]');
    });
});

describe('Proxy Object', () => {
    it('should return proper value for simple object', () => {
        const element = shadowRoot.querySelector('.simple-proxy');
        expect(element.textContent).toBe('x,x|y,42');
    });

    it('should return proper value for array-like object', () => {
        const element = shadowRoot.querySelector('.array-like-proxy');
        expect(element.textContent).toBe('0,a|1,b|2,c');
    });

    it('should return ordered keys', () => {
        const element = shadowRoot.querySelector('.unordered-proxy');
        expect(element.textContent).toBe('2,b|7,c|100,a');
    });

    it('should omit not-enumerable properties', () => {
        const element = shadowRoot.querySelector('.not-enumerable-proxy');
        expect(element.textContent).toBe('z,z');
    });

    it('should omit symbol properties', () => {
        const element = shadowRoot.querySelector('.symbol-proxy');
        expect(element.textContent).toBe('x,x|y,42');
    });

    it('should support iterable protocol', () => {
        const element = shadowRoot.querySelector('.iterable-proxy');
        expect(element.textContent).toBe('[x:x][y:42]');
    });

    it('should support array operations', () => {
        const element = shadowRoot.querySelector('.array-operation-proxy');
        expect(element.textContent).toBe('[x:x][y:42]');
    });
});
