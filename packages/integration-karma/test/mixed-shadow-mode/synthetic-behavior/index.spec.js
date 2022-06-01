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
                tagName: 'x-parent-any-child-any',
                nativeLeaf: true,
            },
            {
                Component: ParentAnyChildReset,
                tagName: 'x-parent-any-child-reset',
                nativeLeaf: true,
            },
            {
                Component: ParentResetChildAny,
                tagName: 'x-parent-reset-child-any',
                nativeLeaf: true,
            },
            {
                Component: ParentResetChildReset,
                tagName: 'x-parent-reset-child-reset',
                nativeLeaf: false,
            },
            {
                Component: ParentLightChildAny,
                tagName: 'x-parent-light-child-any',
                nativeLeaf: true,
            },
            {
                Component: ParentLightChildReset,
                tagName: 'x-parent-light-child-reset',
                nativeLeaf: false,
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
                    const attributes = Array.from(ids.div.attributes)
                        .map((_) => _.name)
                        .filter((_) => _ !== 'data-id');
                    expect(attributes.length).toEqual(nativeLeaf ? 0 : 1);
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
