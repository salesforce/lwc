import { createElement } from 'lwc';
import { ariaProperties, ariaAttributes } from 'test-utils';

import ElementInternal from 'ei/component';

if (process.env.NATIVE_SHADOW && process.env.ELEMENT_INTERNALS_DEFINED) {
    let elm;
    beforeEach(() => {
        elm = createElement('ei-component', { is: ElementInternal });
        document.body.appendChild(elm);
    });

    afterEach(() => {
        document.body.removeChild(elm);
    });

    describe('ElementInternals', () => {
        it('should be associated to the correct element', () => {
            // Ensure external and internal views of shadowRoot are the same
            expect(elm.internals.shadowRoot).toBe(elm.template);
            expect(elm.internals.shadowRoot).toBe(elm.shadowRoot);
        });

        describe('accessibility', () => {
            it('should not reflect to aria-* attributes', () => {
                elm.setAllAriaProps('foo');
                // Firefox does not support ARIAMixin inside ElementInternals
                for (const attr of ariaAttributes) {
                    expect(elm.getAttribute(attr)).not.toEqual('foo');
                }
            });

            it('aria-* attributes do not reflect to internals', () => {
                for (const attr of ariaAttributes) {
                    elm.setAttribute(attr, 'bar');
                }
                // Firefox does not support ARIAMixin inside ElementInternals
                for (const prop of ariaProperties) {
                    expect(elm.internals[prop]).toBeFalsy();
                }
            });
        });
    });
}
