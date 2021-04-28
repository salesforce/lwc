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

    it('the second stylesheet wins in terms of specificity', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(
            getComputedStyle(elm.shadowRoot.querySelector('x-one .my-awesome-class')).opacity
        ).toEqual('0.75');

        expect(
            getComputedStyle(elm.shadowRoot.querySelector('x-two .my-awesome-class')).opacity
        ).toEqual('0.75');

        elm.reverse = true;
        return Promise.resolve().then(() => {
            expect(
                getComputedStyle(elm.shadowRoot.querySelector('x-one .my-awesome-class')).opacity
            ).toEqual('0.5');

            expect(
                getComputedStyle(elm.shadowRoot.querySelector('x-two .my-awesome-class')).opacity
            ).toEqual('0.5');
        });
    });
});
