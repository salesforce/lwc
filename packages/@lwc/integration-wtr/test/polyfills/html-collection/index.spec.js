import { createElement } from 'lwc';
import XTest from 'x/test';

describe('HTMLCollection', () => {
    describe('should be returned by getElementsByTagName()', () => {
        it('when calling from div node inside shadow', () => {
            const elm = createElement('x-test', { is: XTest });
            document.body.appendChild(elm);
            // custom element
            // TODO [#1231]: Add this assertion back once we patch getElementsByTagName
            // expect(elm.getElementsByTagName(`p`).length).toBe(0);
            expect(elm.getElementsByTagName(`p`) instanceof HTMLCollection).toBe(true);
            expect(elm.getElementsByTagName(`p`) + '').toBe('[object HTMLCollection]');
            // regular element
            const div = elm.shadowRoot.querySelector('div');
            expect(div.getElementsByTagName(`p`).length).toBe(3);
            expect(div.getElementsByTagName(`p`) instanceof HTMLCollection).toBe(true);
            expect(div.getElementsByTagName(`p`) + '').toBe('[object HTMLCollection]');
        });

        it('when calling from document.body node', () => {
            expect(document.body.getElementsByTagName(``) instanceof HTMLCollection).toBe(true);
            expect(document.body.getElementsByTagName(``) + '').toBe('[object HTMLCollection]');
        });

        it('when calling from document node', () => {
            expect(document.getElementsByTagName(``) instanceof HTMLCollection).toBe(true);
            expect(document.getElementsByTagName(``) + '').toBe('[object HTMLCollection]');
        });
    });

    describe('should be returned by getElementsByTagNameNS()', () => {
        it('when calling from div node inside shadow', () => {
            const elm = createElement('x-test', { is: XTest });
            document.body.appendChild(elm);
            // custom element
            expect(elm.getElementsByTagNameNS('', ``) instanceof HTMLCollection).toBe(true);
            expect(elm.getElementsByTagNameNS('', ``) + '').toBe('[object HTMLCollection]');
            // regular element
            const div = elm.shadowRoot.querySelector('div');
            expect(div.getElementsByTagNameNS('', ``) instanceof HTMLCollection).toBe(true);
            expect(div.getElementsByTagNameNS('', ``) + '').toBe('[object HTMLCollection]');
        });

        it('when calling from document.body node', () => {
            expect(document.body.getElementsByTagNameNS('', ``) instanceof HTMLCollection).toBe(
                true
            );
            expect(document.body.getElementsByTagNameNS('', ``) + '').toBe(
                '[object HTMLCollection]'
            );
        });

        it('when calling from document node', () => {
            expect(document.getElementsByTagNameNS('', ``) instanceof HTMLCollection).toBe(true);
            expect(document.getElementsByTagNameNS('', ``) + '').toBe('[object HTMLCollection]');
        });
    });

    describe('should be returned by getElementsByClassName()', () => {
        it('when calling from div node inside shadow', () => {
            const elm = createElement('x-test', { is: XTest });
            document.body.appendChild(elm);
            // custom element
            // TODO [#1231]: Add this assertion back once we patch getElementsByClassName
            // expect(elm.getElementsByClassName(`foo`).length).toBe(0);
            expect(elm.getElementsByClassName(`foo`) instanceof HTMLCollection).toBe(true);
            expect(elm.getElementsByClassName(`foo`) + '').toBe('[object HTMLCollection]');
            // regular element
            const div = elm.shadowRoot.querySelector('div');
            expect(div.getElementsByClassName(`foo`).length).toBe(3);
            expect(div.getElementsByClassName(`foo`) instanceof HTMLCollection).toBe(true);
            expect(div.getElementsByClassName(`foo`) + '').toBe('[object HTMLCollection]');
        });

        it('when calling from document.body node', () => {
            expect(document.body.getElementsByClassName(``) instanceof HTMLCollection).toBe(true);
            expect(document.body.getElementsByClassName(``) + '').toBe('[object HTMLCollection]');
        });

        it('when calling from document node', () => {
            expect(document.getElementsByClassName(``) instanceof HTMLCollection).toBe(true);
            expect(document.getElementsByClassName(``) + '').toBe('[object HTMLCollection]');
        });
    });

    describe('should be returned by children getter', () => {
        it('when calling from div node inside shadow', () => {
            const elm = createElement('x-test', { is: XTest });
            document.body.appendChild(elm);
            // custom element
            // TODO [#1231]: Add this assertion back once we patch children
            // expect(elm.children.length).toBe(3);
            expect(elm.children instanceof HTMLCollection).toBe(true);
            expect(elm.children + '').toBe('[object HTMLCollection]');
            // regular element
            const div = elm.shadowRoot.querySelector('div');
            expect(div.children.length).toBe(3);
            expect(div.children instanceof HTMLCollection).toBe(true);
            expect(div.children + '').toBe('[object HTMLCollection]');
        });

        it('when calling from document.body node', () => {
            expect(document.body.children instanceof HTMLCollection).toBe(true);
            expect(document.body.children + '').toBe('[object HTMLCollection]');
        });
    });
});
