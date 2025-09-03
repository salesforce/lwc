import { createElement } from 'lwc';

import Parent from 'x/parent';
import ParentWithIf from 'x/parentWithIf';
import ParentWithIfInverted from 'x/parentWithIfInverted';
import ParentWithIfPreceded from 'x/parentWithIfPreceded';
import ParentWithIfPrecededInverted from 'x/parentWithIfPrecededInverted';

describe('Key outside iteration', () => {
    it('should work with a key attribute defined outside of an iteration', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        elm.color = 'blue';

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
            ).toEqual('blue');
        });
    });

    it('dynamic key followed by if - false then true', () => {
        const elm = createElement('x-parent-with-if', { is: ParentWithIf });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(1);
        elm.color = 'blue';
        elm.shown = true;

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
            ).toEqual('blue');
            expect(elm.shadowRoot.children.length).toEqual(2);
            expect(elm.shadowRoot.children[1].textContent).toEqual('shown');
        });
    });

    it('dynamic key followed by if - true then false', () => {
        const elm = createElement('x-parent-with-if-inverted', { is: ParentWithIfInverted });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(2);
        expect(elm.shadowRoot.children[1].textContent).toEqual('shown');
        elm.color = 'blue';
        elm.shown = true;

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
            ).toEqual('blue');
            expect(elm.shadowRoot.children.length).toEqual(1);
        });
    });

    it('dynamic key preceded by if - false then true', () => {
        const elm = createElement('x-parent-with-if-preceded', { is: ParentWithIfPreceded });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(1);
        elm.color = 'blue';
        elm.shown = true;

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
            ).toEqual('blue');
            expect(elm.shadowRoot.children.length).toEqual(2);
            expect(elm.shadowRoot.children[0].textContent).toEqual('shown');
        });
    });

    it('dynamic key preceded by if - true then false', () => {
        const elm = createElement('x-parent-with-if-preceded-inverted', {
            is: ParentWithIfPrecededInverted,
        });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(2);
        expect(elm.shadowRoot.children[0].textContent).toEqual('shown');
        elm.color = 'blue';
        elm.shown = true;

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
            ).toEqual('blue');
            expect(elm.shadowRoot.children.length).toEqual(1);
        });
    });
});
