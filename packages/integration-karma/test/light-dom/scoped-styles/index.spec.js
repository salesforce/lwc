import { createElement, setFeatureFlagForTest } from 'lwc';
import Basic from 'x/basic';
import Other from 'x/other';
import Switchable from 'x/switchable';
import Unscoped from 'x/unscoped';
import ShadowWithScoped from 'x/shadowWithScoped';

describe('Light DOM scoped CSS', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should scope scoped CSS and allow unscoped CSS to leak out', () => {
        const basicElement = createElement('x-basic', { is: Basic });
        const otherElement = createElement('x-other', { is: Other });
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

    it('should replace scoped styles correctly with dynamic templates', () => {
        const elm = createElement('x-switchable', { is: Switchable });

        document.body.appendChild(elm);

        const rafPromise = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

        // A (no styles) -> B (styles) -> C (no styles) -> D (styles)
        expect(getComputedStyle(elm).marginLeft).toEqual('0px');
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 0)');
        elm.next();
        return rafPromise()
            .then(() => {
                expect(getComputedStyle(elm).marginLeft).toEqual('20px');
                expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(255, 0, 0)');
                elm.next();
                return rafPromise();
            })
            .then(() => {
                expect(getComputedStyle(elm).marginLeft).toEqual('0px');
                expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 0)');
                elm.next();
                return rafPromise();
            })
            .then(() => {
                expect(getComputedStyle(elm).marginLeft).toEqual('30px');
                expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 255)');
            });
    });

    it('only applies styling tokens if scoped styles are present', () => {
        const elm = createElement('x-unscoped', { is: Unscoped });

        document.body.appendChild(elm);

        expect(elm.classList.length).toEqual(0);
        expect(elm.querySelector('div').classList.length).toEqual(0);
    });

    it('disallows scoped styles for shadow components', () => {
        expect(() => {
            const elm = createElement('x-shadow-with-scoped', { is: ShadowWithScoped });
            document.body.appendChild(elm);
        }).toThrowError(
            "Assert Violation: Shadow DOM components template can't use scoped styles (*.scoped.css). Use a regular *.css file."
        );
    });
});
