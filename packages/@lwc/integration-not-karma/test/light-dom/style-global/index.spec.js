import { createElement, setFeatureFlagForTest } from 'lwc';

import Container from 'c/container';
import Two from 'c/two';
import Shadow from 'c/shadow';
import { resetDOM } from '../../../helpers/reset';

describe('Light DOM styling at the global level', () => {
    afterEach(resetDOM);

    it('styles bleed into other light DOM but not shadow DOM components in root context', () => {
        const elm = createElement('c-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeNull();

        const getColor = (elm) => getComputedStyle(elm).color;

        expect(getColor(elm.querySelector('c-one .globally-styled'))).toEqual('rgb(0, 0, 255)');
        expect(getColor(elm.querySelector('c-two .globally-styled'))).toEqual('rgb(0, 0, 255)');
        // synthetic shadow can't do this kind of style encapsulation
        if (process.env.NATIVE_SHADOW) {
            expect(
                getColor(elm.querySelector('c-shadow').shadowRoot.querySelector('.globally-styled'))
            ).toEqual('rgb(0, 0, 0)');
        }

        // sibling elements should also be styled appropriately
        const two = createElement('c-two', { is: Two });
        const shadow = createElement('c-shadow', { is: Shadow });

        document.body.appendChild(two);
        document.body.appendChild(shadow);

        expect(getColor(two.querySelector('.globally-styled'))).toEqual('rgb(0, 0, 255)');
        // synthetic shadow can't do this kind of style encapsulation
        if (process.env.NATIVE_SHADOW) {
            expect(getColor(shadow.shadowRoot.querySelector('.globally-styled'))).toEqual(
                'rgb(0, 0, 0)'
            );
        }
    });

    describe('with flag set', () => {
        beforeAll(() => {
            setFeatureFlagForTest('DISABLE_LIGHT_DOM_UNSCOPED_CSS', true);
        });

        afterAll(() => {
            setFeatureFlagForTest('DISABLE_LIGHT_DOM_UNSCOPED_CSS', false);
        });
        it('do not get applied', () => {
            const elm = createElement('c-container', { is: Container });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogError(/Unscoped CSS is not supported in Light DOM/);
            expect(getComputedStyle(elm.querySelector('c-one .globally-styled')).color).toEqual(
                'rgb(0, 0, 0)'
            );
        });
    });
});
