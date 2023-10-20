import { createElement } from 'lwc';
import { ariaProperties, ariaAttributes } from 'test-utils';

import ElementInternal from 'ei/component';

if (process.env.NATIVE_SHADOW && typeof ElementInternals !== 'undefined') {
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

        it('only allow listed properties accessible', () => {
            if (process.env.NODE_ENV !== 'production') {
                // Not allowed setter
                // Chrome/Firefox/Safari have different messages
                expect(() =>
                    expect(() => (elm.internals.foo = 'bar')).toLogWarningDev(
                        /Only properties defined in the ElementInternals HTML spec are available./
                    )
                ).toThrow();
                // Not allowed getters
                expect(() => elm.internals.foo).toLogWarningDev(
                    /Only properties defined in the ElementInternals HTML spec are available./
                );
                // Allowed getter
                expect(() => elm.internals.ariaAtomic).not.toThrow();
            } else {
                // Not allowed setter
                // Chrome/Firefox/Safari have different messages
                expect(() => (elm.internals.foo = 'bar')).toThrow();
                // Not allowed getters
                expect(elm.internals.foo).toBeUndefined();
                // Allowed getter
                expect(() => elm.internals.ariaAtomic).not.toThrow();
            }
        });

        it('should allow invocations from Object.prototype and symbols', () => {
            // Inherited from Object.prototype
            expect(elm.internals.toString()).toContain('ElementInternals');
            // Calls out to Symbol.toStringTag, will return a false value but reaches into
            // Symbol.toStringTag to verify
            expect(() => hasOwnProperty.call(elm.internals, 'ariaAtomic')).not.toThrow();
        });

        // Firefox does not support ARIAMixin inside ElementInternals.
        // Check to see if ARIAMixin value is defined on ElementInternals before
        // testing accessibility.
        // #TODO[3693]: Firefox is shipping ARIAMixin support in the nightly distribution, remove this check
        // once support has officially been released.
        if (Object.prototype.hasOwnProperty.call(window.ElementInternals.prototype, 'ariaAtomic')) {
            describe('accessibility', () => {
                it('should be able to set ARIAMixin properties on ElementInternals', () => {
                    elm.setAllAriaProps('foo');
                    // Verify ElementInternals proxy setter and getter
                    for (const ariaProp of ariaProperties) {
                        expect(elm.internals[ariaProp]).toEqual('foo');
                    }
                });

                it('should not reflect to aria-* attributes', () => {
                    elm.setAllAriaProps('foo');
                    for (const attr of ariaAttributes) {
                        expect(elm.getAttribute(attr)).not.toEqual('foo');
                    }
                });

                it('aria-* attributes do not reflect to internals', () => {
                    for (const attr of ariaAttributes) {
                        elm.setAttribute(attr, 'bar');
                    }
                    for (const prop of ariaProperties) {
                        expect(elm.internals[prop]).toBeFalsy();
                    }
                });
            });
        }
    });
}
