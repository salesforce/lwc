import { createElement } from 'lwc';

import Parent from 'c/parent';
import ParentWithIf from 'c/parentWithIf';
import ParentWithIfInverted from 'c/parentWithIfInverted';
import ParentWithIfPreceded from 'c/parentWithIfPreceded';
import ParentWithIfPrecededInverted from 'c/parentWithIfPrecededInverted';

describe('Key outside iteration', () => {
    it('should work with a key attribute defined outside of an iteration', async () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        elm.color = 'blue';

        await Promise.resolve();
        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('blue');
    });

    it('dynamic key followed by if - false then true', async () => {
        const elm = createElement('c-parent-with-if', { is: ParentWithIf });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(1);
        elm.color = 'blue';
        elm.shown = true;

        await Promise.resolve();
        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('blue');
        expect(elm.shadowRoot.children.length).toEqual(2);
        expect(elm.shadowRoot.children[1].textContent).toEqual('shown');
    });

    it('dynamic key followed by if - true then false', async () => {
        const elm = createElement('c-parent-with-if-inverted', { is: ParentWithIfInverted });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(2);
        expect(elm.shadowRoot.children[1].textContent).toEqual('shown');
        elm.color = 'blue';
        elm.shown = true;

        await Promise.resolve();
        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('blue');
        expect(elm.shadowRoot.children.length).toEqual(1);
    });

    it('dynamic key preceded by if - false then true', async () => {
        const elm = createElement('c-parent-with-if-preceded', { is: ParentWithIfPreceded });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(1);
        elm.color = 'blue';
        elm.shown = true;

        await Promise.resolve();
        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('blue');
        expect(elm.shadowRoot.children.length).toEqual(2);
        expect(elm.shadowRoot.children[0].textContent).toEqual('shown');
    });

    it('dynamic key preceded by if - true then false', async () => {
        const elm = createElement('c-parent-with-if-preceded-inverted', {
            is: ParentWithIfPrecededInverted,
        });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        expect(elm.shadowRoot.children.length).toEqual(2);
        expect(elm.shadowRoot.children[0].textContent).toEqual('shown');
        elm.color = 'blue';
        elm.shown = true;

        await Promise.resolve();
        expect(
            elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div').textContent
        ).toEqual('blue');
        expect(elm.shadowRoot.children.length).toEqual(1);
    });
});
