import { createElement, setFeatureFlagForTest } from 'lwc';
import Container from 'x/container';

// This test only matters for synthetic shadow
if (!process.env.NATIVE_SHADOW) {
    describe('Light DOM and synthetic shadow', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
        });
        afterEach(() => {
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });
        it('shadowToken and domManual are not set for shadow components', () => {
            // shadow grandparent, light child, shadow grandchild
            const elm = createElement('x-container', { is: Container });
            document.body.appendChild(elm);

            // shadow grandparent
            expect(elm.shadowRoot.querySelector('h1').$shadowToken$).toEqual(
                'x-container_container'
            );
            expect(elm.shadowRoot.querySelector('div').$domManual$).toEqual(true);
            expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toEqual(
                'rgb(0, 128, 0)'
            );

            // light child
            const child = elm.shadowRoot.querySelector('x-light');
            expect(child.querySelector('h1').$shadowToken$).toEqual(undefined);
            expect(child.querySelector('div').$domManual$).toEqual(undefined);
            expect(getComputedStyle(child.querySelector('h1')).backgroundColor).toEqual(
                'rgb(255, 0, 0)'
            );

            // shadow grandchild
            const grandchild = child.querySelector('x-grandchild');
            expect(grandchild.shadowRoot.querySelector('h1').$shadowToken$).toEqual(
                'x-grandchild_grandchild'
            );
            expect(grandchild.shadowRoot.querySelector('div').$domManual$).toEqual(true);
            expect(
                getComputedStyle(grandchild.shadowRoot.querySelector('h1')).outlineColor
            ).toEqual('rgb(0, 255, 255)');

            // append to lwc:dom="manual" containers
            elm.shadowRoot.querySelector('div').appendChild(document.createElement('h1'));
            child.querySelector('div').appendChild(document.createElement('h1'));
            grandchild.shadowRoot.querySelector('div').appendChild(document.createElement('h1'));

            // wait microtask for mutation observer to take effect
            return Promise.resolve().then(() => {
                expect(getComputedStyle(elm.shadowRoot.querySelector('div > h1')).color).toEqual(
                    'rgb(0, 128, 0)'
                );
                expect(getComputedStyle(child.querySelector('div > h1')).backgroundColor).toEqual(
                    'rgb(255, 0, 0)'
                );
                expect(
                    getComputedStyle(grandchild.shadowRoot.querySelector('div > h1')).outlineColor
                ).toEqual('rgb(0, 255, 255)');
            });
        });
    });
}
