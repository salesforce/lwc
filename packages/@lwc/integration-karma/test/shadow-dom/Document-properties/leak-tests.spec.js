import { createElement } from 'lwc';

import Leak from 'x/leak';

let elm;
beforeEach(() => {
    elm = createElement('x-leak', { is: Leak });
    document.body.appendChild(elm);
});

it('Sanity check', () => {
    expect(document.querySelector('x-leak')).toBe(elm);
});

describe('Document.getElementById()', () => {
    it('should not match on id', () => {
        expect(document.getElementById('leak-id')).toBe(null);
    });
});

describe('Document.querySelector()', () => {
    it('should not match on tag name', () => {
        expect(document.querySelector('marquee')).toBe(null);
    });
    it('should not match on class name', () => {
        expect(document.querySelector('.leak-class')).toBe(null);
    });
    it('should not match on attribute', () => {
        expect(document.querySelector('[name="leak-name"]')).toBe(null);
    });
});

describe('Document.querySelectorAll()', () => {
    it('should not match on tag name', () => {
        expect(document.querySelectorAll('marquee').length).toBe(0);
    });
    it('should not match on class name', () => {
        expect(document.querySelectorAll('.leak-class').length).toBe(0);
    });
    it('should not match on attribute', () => {
        expect(document.querySelectorAll('[name="leak-name"]').length).toBe(0);
    });
});

describe('Document.getElementsByTagName()', () => {
    it('should not match on tag name', () => {
        expect(document.getElementsByTagName('marquee').length).toBe(0);
    });
});

describe('Document.getElementsByTagNameNS()', () => {
    it('should not match on tag name', () => {
        expect(document.getElementsByTagNameNS('http://www.w3.org/2000/svg', '*').length).toBe(0);
    });
});

describe('Document.getElementsByName()', () => {
    it('should not match on name', () => {
        expect(document.getElementsByName('leak-name').length).toBe(0);
    });
});
