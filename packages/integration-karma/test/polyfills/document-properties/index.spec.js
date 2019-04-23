import { createElement } from 'test-utils';
import XTest from 'x/test';

describe('should not provide access to elements inside shadow tree', () => {
    beforeAll(() => {
        const elm = createElement('x-test-document-properties', { is: XTest });
        document.body.appendChild(elm);
    });

    function testMethodReturnsEmptyNodeList(api, selector) {
        it(`document.${api}`, () => {
            expect(document[api](selector).length).toBe(0);
        });
    }

    testMethodReturnsEmptyNodeList('querySelectorAll', '.in-the-shadow');
    testMethodReturnsEmptyNodeList('getElementsByClassName', 'in-the-shadow');
    testMethodReturnsEmptyNodeList('getElementsByTagName', 'x-unique-tag-name');
    testMethodReturnsEmptyNodeList('getElementsByName', 'in-the-shadow');

    it('document.getElementById', () => {
        // get the dynamic id
        const id = document
            .querySelector('x-test-document-properties')
            .shadowRoot.querySelector('.in-the-shadow').id;
        expect(document.getElementById(`in-the-shadow-${id}`)).toBe(null);
    });
    it('document.querySelector', () => {
        expect(document.querySelector('.in-the-shadow')).toBe(null);
    });
    it('document.getElementsByTagNameNS', () => {
        expect(
            document.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'x-unique-tag-name')
                .length
        ).toBe(0);
    });
});

describe('should provide access to elements outside shadow tree', () => {
    let container;
    // randomize the selectors so that it does not interfere with the test suite above
    const random = Math.floor(Math.random() * 100);
    beforeAll(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = `<div class='in-the-shadow-${random}' id='in-the-shadow-${random}'></div>
                               <input name='in-the-shadow-${random}'> </input>`;
        container.appendChild(document.createElement(`x-unique-tag-name-${random}`));
    });
    afterAll(() => {
        if (container) {
            document.body.removeChild(container);
        }
    });

    function testMethodReturnsNode(api, selector) {
        it(`document.${api}`, () => {
            expect(document[api](selector).length).toBe(1);
        });
    }

    testMethodReturnsNode('querySelectorAll', `.in-the-shadow-${random}`);
    testMethodReturnsNode('getElementsByClassName', `in-the-shadow-${random}`);
    testMethodReturnsNode('getElementsByTagName', `x-unique-tag-name-${random}`);
    testMethodReturnsNode('getElementsByName', `in-the-shadow-${random}`);

    it('document.getElementById', () => {
        expect(document.getElementById(`in-the-shadow-${random}`)).not.toBe(null);
    });
    it('document.querySelector', () => {
        expect(document.querySelector(`.in-the-shadow-${random}`)).not.toBe(null);
    });
    it('document.getElementsByTagNameNS', () => {
        expect(
            document.getElementsByTagNameNS(
                'http://www.w3.org/1999/xhtml',
                `x-unique-tag-name-${random}`
            ).length
        ).toBe(1);
    });
});
