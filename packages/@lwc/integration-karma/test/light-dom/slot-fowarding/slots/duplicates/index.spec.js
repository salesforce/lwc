import { createElement } from 'lwc';
import LightContainer from 'light/container';
import ShadowContainer from 'shadow/container';

const scenarios = [
    {
        name: 'light',
        tagName: 'light-container',
        Ctor: LightContainer,
    },
    {
        name: 'shadow',
        tagName: 'shadow-container',
        Ctor: ShadowContainer,
    },
];

scenarios.forEach(({ name, tagName, Ctor }) => {
    describe(name, () => {
        // The bug is originally in light DOM, but the shadow DOM tests are just to demonstrate
        // that the same LWC templates work correctly in shadow DOM mode.
        it('issue #4446 - duplicate named slots with slot forwarding and reactivity', async () => {
            const elm = createElement(tagName, { is: Ctor });

            document.body.appendChild(elm);

            // step 1 - initial render with isTablet=false
            await Promise.resolve();

            let header, menu, span;

            const assertExpectedHtml = () => {
                const root = elm.shadowRoot || elm;
                header = root.querySelector('light-header,shadow-header');
                menu = root.querySelector('light-menu,shadow-menu');
                span = root.querySelector('span');

                expect(header).not.toBeNull();
                expect(menu).not.toBeNull();
                expect(span).not.toBeNull();
                expect(span.textContent).toBe('Hello');
            };

            assertExpectedHtml();

            // step 2 - change child property without going through the parent
            header.isTablet = true;
            await Promise.resolve();

            assertExpectedHtml();

            // step 3 - toggle back to original state
            header.isTablet = false;
            await Promise.resolve();

            assertExpectedHtml();
        });
    });
});
