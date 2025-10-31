import { createElement } from 'lwc';
import Basic from 'c/basic';
import Other from 'c/other';
import Switchable from 'c/switchable';
import Unscoped from 'c/unscoped';
import ShadowWithScoped from 'c/shadowWithScoped';
import PseudoParent from 'c/pseudoParent';
import { extractDataIds } from '../../../helpers/utils.js';

describe('Light DOM scoped CSS', () => {
    it('should scope scoped CSS and allow unscoped CSS to leak out', () => {
        const basicElement = createElement('c-basic', { is: Basic });
        const otherElement = createElement('c-other', { is: Other });
        document.body.appendChild(basicElement);
        document.body.appendChild(otherElement);

        const basicHostComputed = getComputedStyle(basicElement);
        const basicComputed = getComputedStyle(basicElement.querySelector('div'));
        const otherComputed = getComputedStyle(otherElement.querySelector('div'));
        expect(basicHostComputed.backgroundColor).toEqual('rgb(255, 0, 0)');
        expect(basicComputed.color).toEqual('rgb(0, 128, 0)');
        expect(basicComputed.marginLeft).toEqual('10px');
        expect(basicComputed.marginRight).toEqual('5px');
        expect(otherComputed.color).toEqual('rgb(0, 0, 0)');
        expect(otherComputed.marginLeft).toEqual('10px');
        expect(otherComputed.marginRight).toEqual('5px');
    });

    it('should replace scoped styles correctly with dynamic templates', async () => {
        const elm = createElement('c-switchable', { is: Switchable });

        document.body.appendChild(elm);

        const rafPromise = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

        // A (no styles) -> B (styles) -> C (no styles) -> D (styles)
        expect(getComputedStyle(elm).marginLeft).toEqual('0px');
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 0)');
        elm.next();
        await rafPromise();
        expect(getComputedStyle(elm).marginLeft).toEqual('20px');
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(255, 0, 0)');
        elm.next();
        await rafPromise();
        expect(getComputedStyle(elm).marginLeft).toEqual('0px');
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 0)');
        elm.next();
        await rafPromise();
        expect(getComputedStyle(elm).marginLeft).toEqual('30px');
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 255)');
    });

    it('only applies styling tokens if scoped styles are present', () => {
        const elm = createElement('c-unscoped', { is: Unscoped });

        document.body.appendChild(elm);

        expect(elm.classList.length).toEqual(0);
        expect(elm.querySelector('div').classList.length).toEqual(0);
    });

    it('can scope shadow DOM styles as well', () => {
        const elm = createElement('c-shadow-with-scoped', { is: ShadowWithScoped });
        document.body.appendChild(elm);
        expect(getComputedStyle(elm).backgroundColor).toEqual('rgb(0, 0, 255)');
        expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual(
            'rgb(255, 0, 0)'
        );
        expect(
            getComputedStyle(elm.shadowRoot.querySelector('c-light-child div')).color
        ).not.toEqual('rgb(255, 0, 0)');
    });

    it('properly scopes pseudo-elements', () => {
        const elm = createElement('c-pseudo-parent', { is: PseudoParent });
        document.body.appendChild(elm);
        const ids = extractDataIds(elm);

        expect(getComputedStyle(ids.parentDiv, '::after').color).toEqual('rgb(255, 0, 0)');
        expect(getComputedStyle(ids.childDiv, '::after').color).toEqual('rgb(0, 0, 0)');
    });
});
