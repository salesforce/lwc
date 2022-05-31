import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';
import Container from 'x/container';

// In compat mode, native components and synthetic components will both render
// in synthetic style; there's no difference.
if (!process.env.NATIVE_SHADOW && !process.env.COMPAT) {
    describe('dual component', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
        });
        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
        });

        ['native', 'synthetic'].forEach((firstRenderMode) => {
            describe(`renders first in ${firstRenderMode}`, () => {
                it(`should set the tokens for synthetic shadow`, () => {
                    const elm = createElement('x-container', { is: Container });
                    elm.syntheticFirst = firstRenderMode === 'synthetic';
                    document.body.appendChild(elm);

                    const synthetic = extractDataIds(elm.shadowRoot.querySelector('x-component'));
                    const native = extractDataIds(
                        elm.shadowRoot
                            .querySelector('x-native')
                            .shadowRoot.querySelector('x-component')
                    );

                    expect(synthetic.div.hasAttribute('x-component_component')).toBe(true);
                    expect(native.div.hasAttribute('x-component_component')).toBe(false);
                });

                it(`should mangle the IDs in synthetic shadow`, () => {
                    const elm = createElement('x-container', { is: Container });
                    elm.syntheticFirst = firstRenderMode === 'synthetic';
                    document.body.appendChild(elm);

                    const synthetic = extractDataIds(elm.shadowRoot.querySelector('x-component'));
                    const native = extractDataIds(
                        elm.shadowRoot
                            .querySelector('x-native')
                            .shadowRoot.querySelector('x-component')
                    );

                    expect(synthetic.label.id).not.toEqual('foo');
                    expect(synthetic.input.getAttribute('aria-labelledby')).not.toEqual('foo');
                    expect(synthetic.label.id).toEqual(
                        synthetic.input.getAttribute('aria-labelledby')
                    );

                    expect(native.label.id).toEqual('foo');
                    expect(native.input.getAttribute('aria-labelledby')).toEqual('foo');
                });
            });
        });
    });
}
