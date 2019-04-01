import { createElement } from 'test-utils';
import XPlainArray from 'x/plainArray';

describe('Plain array methods', () => {
    let shadowRoot;
    beforeAll(() => {
        const elm = createElement('x-plain-array', { is: XPlainArray });
        document.body.appendChild(elm);
        shadowRoot = elm.shadowRoot;
    });

    it('should display unshifted items correctly', function() {
        const elements = shadowRoot.querySelectorAll('.push-list-plain li');
        expect(elements[0].textContent).toBe('1');
        expect(elements[1].textContent).toBe('2');
        expect(elements[2].textContent).toBe('3');
        expect(elements[3].textContent).toBe('4');
    });

    it('should display pushed items correctly', function() {
        const elements = shadowRoot.querySelectorAll('.push-list li');
        expect(elements[0].textContent).toBe('first');
        expect(elements[1].textContent).toBe('second');
        expect(elements[2].textContent).toBe('proxy');
        expect(elements[3].textContent).toBe('fourth');
    });

    it('should display concat items correctly', function() {
        const elements = shadowRoot.querySelectorAll('.concat-list-plain li');
        expect(elements[0].textContent).toBe('1');
        expect(elements[1].textContent).toBe('2');
        expect(elements[2].textContent).toBe('3');
        expect(elements[3].textContent).toBe('4');
    });

    it('should display concat items correctly', function() {
        const elements = shadowRoot.querySelectorAll('.concat-list-proxy li');
        expect(elements[0].textContent).toBe('first');
        expect(elements[1].textContent).toBe('second');
        expect(elements[2].textContent).toBe('proxy');
    });
});
