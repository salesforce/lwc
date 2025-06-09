import { createElement } from 'lwc';
import { catchUnhandledRejectionsAndErrors } from 'test-utils';
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
        let caughtErrors;

        beforeEach(() => {
            caughtErrors = [];
        });

        // TODO [#4451]: synthetic shadow throws unhandled rejection errors
        // These handlers capture errors thrown in synthetic shadow mode after the rerendering happens.
        catchUnhandledRejectionsAndErrors((error) => {
            caughtErrors.push(error);
        });

        afterEach(() => {
            caughtErrors = undefined;
        });

        // The bug is originally in light DOM, but the shadow DOM tests are just to demonstrate
        // that the same LWC templates work correctly in shadow DOM mode.
        it('issue #4446 - duplicate named slots with slot forwarding and reactivity', async () => {
            const elm = createElement(tagName, { is: Ctor });

            document.body.appendChild(elm);

            // Step 1 - initial render with isTablet=false
            await Promise.resolve();

            let header;

            const assertExpectedHtml = () => {
                const root = elm.shadowRoot || elm;
                header = root.querySelector('light-header,shadow-header');
                const menu = root.querySelector('light-menu,shadow-menu');
                const span = root.querySelector('span');

                expect(header).not.toBeNull();
                expect(menu).not.toBeNull();
                expect(span).not.toBeNull();
                expect(span.textContent).toBe('Hello');
            };

            assertExpectedHtml();

            // Step 2 - change child property _without_ going through the parent
            // This is important to trigger the bug - the child must re-render without a parent re-render
            // (In the real world, this would most likely happen with an `@wire`)
            header.isTablet = true;
            await Promise.resolve();

            assertExpectedHtml();

            // Step 3 - toggle back to original state
            header.isTablet = false;
            await Promise.resolve();

            assertExpectedHtml();

            // TODO [#4451]: synthetic shadow throws unhandled rejection errors
            // Remove the element and wait two macrotasks - this is when the unhandled rejections occur
            document.body.removeChild(elm);
            await new Promise((resolve) => setTimeout(resolve));
            await new Promise((resolve) => setTimeout(resolve));

            if (name === 'shadow' && !process.env.NATIVE_SHADOW) {
                expect(caughtErrors.length).toBe(2);
                for (const caughtError of caughtErrors) {
                    expect(caughtError.message).toMatch(
                        /The node to be removed is not a child of this node|The object can not be found here/
                    );
                }
            } else {
                expect(caughtErrors.length).toBe(0);
            }
        });
    });
});
