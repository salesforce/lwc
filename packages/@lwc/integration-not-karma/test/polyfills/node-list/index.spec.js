import { createElement } from 'lwc';
import XTest from 'x/test';

describe('NodeList', () => {
    describe('should be returned by querySelectorAll()', () => {
        it('when calling from div node inside shadow', () => {
            const elm = createElement('x-test', { is: XTest });
            document.body.appendChild(elm);
            // custom element
            expect(elm.querySelectorAll('*').length).toBe(0);
            expect(elm.querySelectorAll('*') instanceof NodeList).toBe(true);
            expect(elm.querySelectorAll('*') + '').toBe('[object NodeList]');
            // regular element
            const div = elm.shadowRoot.querySelector('div');
            expect(div.querySelectorAll('*').length).toBe(3);
            expect(div.querySelectorAll('*') instanceof NodeList).toBe(true);
            expect(div.querySelectorAll('*') + '').toBe('[object NodeList]');
        });

        it('when calling from document.body node', () => {
            expect(document.body.querySelectorAll('*') instanceof NodeList).toBe(true);
            expect(document.body.querySelectorAll('*') + '').toBe('[object NodeList]');
        });

        it('when calling from document node', () => {
            expect(document.querySelectorAll('*') instanceof NodeList).toBe(true);
            expect(document.querySelectorAll('*') + '').toBe('[object NodeList]');
        });
    });

    describe('should be returned by childNodes getter', () => {
        it('when calling from div node inside shadow', () => {
            const elm = createElement('x-test', { is: XTest });
            document.body.appendChild(elm);
            // custom element
            // Note: we can check for the length of childNodes on custom elements
            // because in IE11 we do some tracks to show the shadowRoot instance in devtool
            expect(elm.childNodes instanceof NodeList).toBe(true);
            expect(elm.childNodes + '').toBe('[object NodeList]');
            // regular element
            const div = elm.shadowRoot.querySelector('div');
            expect(div.childNodes.length).toBe(3);
            expect(div.childNodes instanceof NodeList).toBe(true);
            expect(div.childNodes + '').toBe('[object NodeList]');
        });

        it('when calling from document.body node', () => {
            expect(document.body.childNodes instanceof NodeList).toBe(true);
            expect(document.body.childNodes + '').toBe('[object NodeList]');
        });
    });
});
