import { createElement } from 'test-utils';

import Test from 'x/test';

fdescribe('document.prototype query methods', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    it('should not have access to shadowed elements (getElementById)', () => {
        const mangledId = elm.shadowRoot.querySelector('x-parent').id;
        expect(document.getElementById(mangledId)).toBeNull();
    });

    it('should not have access to shadowed elements (querySelector)', () => {
        expect(document.querySelector('input')).toBeNull();
        expect(document.querySelector('.bar')).toBeNull();
        expect(document.querySelector('[name="baz"]')).toBeNull();
    });

    it('should not have access to shadowed elements (querySelectorAll)', () => {
        expect(document.querySelectorAll('input').length).toBe(0);
        expect(document.querySelectorAll('.bar').length).toBe(0);
        expect(document.querySelectorAll('[name="baz"]').length).toBe(0);
    });

    it('should not have access to shadowed elements (getElementsByClassName)', () => {
        expect(document.getElementsByClassName('bar').length).toBe(0);
    });

    it('should not have access to shadowed elements (getElementsByTagName)', () => {
        expect(document.getElementsByTagName('input').length).toBe(0);
    });

    it('should not have access to shadowed elements (getElementsByTagNameNS)', () => {
        expect(document.getElementsByTagNameNS('http://www.w3.org/2000/svg', '*').length).toBe(0);
    });

    it('should not have access to shadowed elements (getElementsByName)', () => {
        expect(document.getElementsByName('baz').length).toBe(0);
    });
});
