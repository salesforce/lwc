import { createElement, setFeatureFlagForTest } from 'lwc';
import Container from 'x/container';

describe('Light DOM styling - multiple light DOM components', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('styles bleed mutually across light DOM components', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();

        const getStyle = (elm) => {
            const { color, backgroundColor } = getComputedStyle(elm);
            return { color, backgroundColor };
        };

        expect(getStyle(elm.shadowRoot.querySelector('x-one .my-awesome-class'))).toEqual({
            color: 'rgb(255, 255, 0)',
            backgroundColor: 'rgb(0, 0, 0)',
        });
        expect(getStyle(elm.shadowRoot.querySelector('x-two .my-awesome-class'))).toEqual({
            color: 'rgb(255, 255, 0)',
            backgroundColor: 'rgb(0, 0, 0)',
        });
    });

    it('default order - the first stylesheet wins', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(
            getComputedStyle(elm.shadowRoot.querySelector('x-one .my-awesome-class')).borderColor
        ).toEqual('rgb(128, 0, 128)'); // purple

        expect(
            getComputedStyle(elm.shadowRoot.querySelector('x-two .my-awesome-class')).borderColor
        ).toEqual('rgb(128, 0, 128)'); // purple
    });

    it('reverse order - the second stylesheet wins', () => {
        const elm = createElement('x-container', { is: Container });
        elm.reverse = true;
        document.body.appendChild(elm);

        expect(
            getComputedStyle(elm.shadowRoot.querySelector('x-one .my-awesome-class')).borderColor
        ).toEqual('rgb(210, 105, 30)'); // chocolate

        expect(
            getComputedStyle(elm.shadowRoot.querySelector('x-two .my-awesome-class')).borderColor
        ).toEqual('rgb(210, 105, 30)'); // chocolate
    });
});
