import { createElement, setFeatureFlagForTest } from 'lwc';
import Container from 'x/container';

// synthetic shadow can't do this kind of style encapsulation
if (process.env.NATIVE_SHADOW === true) {
    describe('Light DOM styling with :host', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
        });
        afterEach(() => {
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });
        it(':host can style a containing shadow component', () => {
            const elm = createElement('x-container', { is: Container });
            document.body.appendChild(elm);

            expect(elm.shadowRoot).not.toBeNull();

            expect(getComputedStyle(elm).backgroundColor).toEqual('rgb(139, 69, 19)');
        });
    });
}
