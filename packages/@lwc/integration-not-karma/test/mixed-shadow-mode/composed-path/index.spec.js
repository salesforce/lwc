import { createElement } from 'lwc';
import Test from 'c/test';

describe('event.composedPath() of event dispatched from closed shadow root', () => {
    it('should have shadowed elements when invoked inside the shadow root', async () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        await Promise.resolve();
        elm.clickShadowedButton();
        expect(elm.getShadowedComposedPath()).toEqual([
            expect.any(HTMLElement), // button
            expect.any(Object), // #shadow-root(closed)
            elm.child,
            elm.shadowRoot,
            elm,
            document.body,
            document.documentElement,
            document,
            window,
        ]);
    });

    it('should not have shadowed elements when invoked outside the shadow root', async () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        await Promise.resolve();
        elm.clickShadowedButton();
        expect(elm.getComposedPath()).toEqual([
            elm.child,
            elm.shadowRoot,
            elm,
            document.body,
            document.documentElement,
            document,
            window,
        ]);
    });
});
