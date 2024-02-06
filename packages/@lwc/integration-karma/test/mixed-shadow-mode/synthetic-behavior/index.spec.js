import { createElement } from 'lwc';
import { extractDataIds, isNativeShadowRootInstance } from 'test-utils';
import ParentAnyChildAny from 'x/parentAnyChildAny';
import ParentAnyChildReset from 'x/parentAnyChildReset';
import ParentResetChildAny from 'x/parentResetChildAny';
import ParentResetChildReset from 'x/parentResetChildReset';
import ParentLightChildAny from 'x/parentLightChildAny';
import ParentLightChildReset from 'x/parentLightChildReset';
import GrandparentAnyParentAnyChildAny from 'x/grandparentAnyParentAnyChildAny';
import GrandparentAnyParentAnyChildReset from 'x/grandparentAnyParentAnyChildReset';
import GrandparentAnyParentResetChildAny from 'x/grandparentAnyParentResetChildAny';
import GrandparentAnyParentResetChildReset from 'x/grandparentAnyParentResetChildReset';
import GrandparentResetParentAnyChildAny from 'x/grandparentResetParentAnyChildAny';
import GrandparentResetParentAnyChildReset from 'x/grandparentResetParentAnyChildReset';
import GrandparentResetParentResetChildAny from 'x/grandparentResetParentResetChildAny';
import GrandparentResetParentResetChildReset from 'x/grandparentResetParentResetChildReset';

if (!process.env.NATIVE_SHADOW) {
    describe('synthetic behavior', () => {
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
            {
                Component: GrandparentAnyParentAnyChildAny,
                tagName: 'x-grandparent-any-parent-any-child-any',
                nativeLeaf: true,
            },
            {
                Component: GrandparentAnyParentAnyChildReset,
                tagName: 'x-grandparent-any-parent-any-child-reset',
                nativeLeaf: true,
            },
            {
                Component: GrandparentAnyParentResetChildAny,
                tagName: 'x-grandparent-any-parent-reset-child-any',
                nativeLeaf: true,
            },
            {
                Component: GrandparentAnyParentResetChildReset,
                tagName: 'x-grandparent-any-parent-reset-child-reset',
                nativeLeaf: true,
            },
            {
                Component: GrandparentResetParentAnyChildAny,
                tagName: 'x-grandparent-reset-parent-any-child-any',
                nativeLeaf: true,
            },
            {
                Component: GrandparentResetParentAnyChildReset,
                tagName: 'x-grandparent-reset-parent-any-child-reset',
                nativeLeaf: true,
            },
            {
                Component: GrandparentResetParentResetChildAny,
                tagName: 'x-grandparent-reset-parent-reset-child-any',
                nativeLeaf: true,
            },
            {
                Component: GrandparentResetParentResetChildReset,
                tagName: 'x-grandparent-reset-parent-reset-child-reset',
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

                it('should render the shadow root in the correct shadow mode', () => {
                    expect(isNativeShadowRootInstance(ids.leaf.shadowRoot)).toEqual(nativeLeaf);
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
