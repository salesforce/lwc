import { createElement } from 'lwc';
import XTest from 'x/test';

describe('should not provide access to elements inside shadow tree', () => {
    beforeEach(() => {
        const elm = createElement('x-test-document-body-properties', { is: XTest });
        document.body.appendChild(elm);
    });

    function testMethodReturnsEmptyNodeList(api, selector) {
        it(`document.body.${api}`, () => {
            expect(document.body[api](selector).length).toBe(0);
        });
    }

    testMethodReturnsEmptyNodeList('querySelectorAll', '.in-the-shadow');
    testMethodReturnsEmptyNodeList('getElementsByClassName', 'in-the-shadow');
    testMethodReturnsEmptyNodeList('getElementsByTagName', 'x-unique-tag-name');

    it('document.body.querySelector', () => {
        expect(document.body.querySelector('.in-the-shadow')).toBe(null);
    });
    it('document.body.getElementsByTagNameNS', () => {
        expect(
            document.body.getElementsByTagNameNS(
                'http://www.w3.org/1999/xhtml',
                'x-unique-tag-name'
            ).length
        ).toBe(0);
    });
});

describe('should provide access to elements outside shadow tree', () => {
    let container;
    // randomize the selectors so that it does not interfere with the test suite above
    const random = Math.floor(Math.random() * 100);
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = `<div class='in-the-shadow-${random}'></div>
                               <input name='in-the-shadow-${random}'>`;
        container.appendChild(document.createElement(`x-unique-tag-name-${random}`));
    });

    function testMethodReturnsNode(api, selector) {
        it(`document.body.${api}`, () => {
            expect(document.body[api](selector).length).toBe(1);
        });
    }

    testMethodReturnsNode('querySelectorAll', `.in-the-shadow-${random}`);
    testMethodReturnsNode('getElementsByClassName', `in-the-shadow-${random}`);
    testMethodReturnsNode('getElementsByTagName', `x-unique-tag-name-${random}`);

    it('document.body.querySelector', () => {
        expect(document.body.querySelector(`.in-the-shadow-${random}`)).not.toBe(null);
    });
    it('document.body.getElementsByTagNameNS', () => {
        expect(
            document.body.getElementsByTagNameNS(
                'http://www.w3.org/1999/xhtml',
                `x-unique-tag-name-${random}`
            ).length
        ).toBe(1);
    });
});
