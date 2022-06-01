import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';
import ParentAnyChildAny from 'x/parentAnyChildAny';
import ParentAnyChildReset from 'x/parentAnyChildReset';
import ParentResetChildAny from 'x/parentResetChildAny';
import ParentResetChildReset from 'x/parentResetChildReset';
import ParentLightChildAny from 'x/parentLightChildAny';
import ParentLightChildReset from 'x/parentLightChildReset';

// In compat mode, native components and synthetic components will both render
// in synthetic style; there's no difference.
if (!process.env.NATIVE_SHADOW && !process.env.COMPAT) {
    describe('synthetic behavior', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
        });
        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
        });

        const scenarios = [
            {
                Component: ParentAnyChildAny,
                nativeLeaf: true,
                tagName: 'x-parent-any-child-any',
            },
            {
                Component: ParentAnyChildReset,
                nativeLeaf: true,
                tagName: 'x-parent-any-child-reset',
            },
            {
                Component: ParentResetChildAny,
                nativeLeaf: true,
                tagName: 'x-parent-reset-child-any',
            },
            {
                Component: ParentResetChildReset,
                nativeLeaf: false,
                tagName: 'x-parent-reset-child-reset',
            },
            {
                Component: ParentLightChildAny,
                nativeLeaf: true,
                tagName: 'x-parent-light-child-any',
            },
            {
                Component: ParentLightChildReset,
                nativeLeaf: false,
                tagName: 'x-parent-light-child-reset',
            },
        ];

        scenarios.forEach(({ Component, nativeLeaf, tagName }) => {
            describe(tagName, () => {
                let elm;
                let ids;

                beforeEach(() => {
                    elm = createElement(tagName, { is: Component });
                    document.body.appendChild(elm);
                    ids = extractDataIds(elm);
                });

                it(`should set the scope attributes only in synthetic shadow`, () => {
                    expect(ids.div.hasAttribute('x-component_component')).toBe(!nativeLeaf);
                    expect(getComputedStyle(ids.div).color).toEqual('rgb(0, 0, 255)');
                });

                it(`should mangle the IDs only in synthetic shadow`, () => {
                    if (nativeLeaf) {
                        expect(ids.label.id).toEqual('foo');
                        expect(ids.input.getAttribute('aria-labelledby')).toEqual('foo');
                    } else {
                        expect(ids.label.id).not.toEqual('foo');
                        expect(ids.input.getAttribute('aria-labelledby')).not.toEqual('foo');
                        expect(ids.label.id).toEqual(ids.input.getAttribute('aria-labelledby'));
                    }
                });
            });
        });
    });
}
