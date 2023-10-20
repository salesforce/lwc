import { createElement } from 'lwc';
import XTest from 'x/test';
import XWithLwcDomManual from 'x/withLwcDomManual';

describe('should not provide access to elements inside shadow tree', () => {
    beforeEach(() => {
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

describe('dynamic nodes', () => {
    it('if parent node has lwc:dom="manual", child node is not accessible', () => {
        const elm = createElement('x-test-with-lwc-dom-manual', { is: XWithLwcDomManual });
        document.body.appendChild(elm);
        const span = document.createElement('span');
        span.classList.add('manual-span');
        const div = elm.shadowRoot.querySelector('div');
        div.appendChild(span);
        return new Promise((resolve) => {
            setTimeout(resolve);
        }).then(() => {
            expect(document.querySelector('span.manual-span')).toBe(null);
        });
    });
    if (!process.env.NATIVE_SHADOW) {
        // TODO [#1252]: old behavior that is still used by some pieces of the platform
        // that is only useful in synthetic mode where elements inserted manually without lwc:dom="manual"
        // are still considered global elements
        it('if parent node does not have lwc:dom="manual", child node is accessible', () => {
            const elm = createElement('x-test', { is: XTest });
            document.body.appendChild(elm);
            spyOn(console, 'warn'); // ignore warning about manipulating node without lwc:dom="manual

            const h2 = document.createElement('h2');
            h2.classList.add('manual-h2');
            const div = elm.shadowRoot.querySelector('.in-the-shadow');
            div.appendChild(h2);
            return new Promise((resolve) => {
                setTimeout(resolve);
            }).then(() => {
                expect(document.querySelector('h2.manual-h2')).toBe(h2);
            });
        });
    }
});

describe('should provide access to elements outside shadow tree', () => {
    let container;
    // randomize the selectors so that it does not interfere with the test suite above
    const random = Math.floor(Math.random() * 100);
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = `<div class='in-the-shadow-${random}' id='in-the-shadow-${random}'></div>
                               <input name='in-the-shadow-${random}'>`;
        container.appendChild(document.createElement(`x-unique-tag-name-${random}`));
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
