import { createElement } from 'lwc';
import ParentAnyChildAny from 'c/parentAnyChildAny';
import ParentAnyChildReset from 'c/parentAnyChildReset';
import ParentResetChildAny from 'c/parentResetChildAny';
import ParentResetChildReset from 'c/parentResetChildReset';
import ParentLightChildAny from 'c/parentLightChildAny';
import ParentLightChildReset from 'c/parentLightChildReset';
import GrandparentAnyParentAnyChildAny from 'c/grandparentAnyParentAnyChildAny';
import GrandparentAnyParentAnyChildReset from 'c/grandparentAnyParentAnyChildReset';
import GrandparentAnyParentResetChildAny from 'c/grandparentAnyParentResetChildAny';
import GrandparentAnyParentResetChildReset from 'c/grandparentAnyParentResetChildReset';
import GrandparentResetParentAnyChildAny from 'c/grandparentResetParentAnyChildAny';
import GrandparentResetParentAnyChildReset from 'c/grandparentResetParentAnyChildReset';
import GrandparentResetParentResetChildAny from 'c/grandparentResetParentResetChildAny';
import GrandparentResetParentResetChildReset from 'c/grandparentResetParentResetChildReset';
import { extractDataIds, isNativeShadowRootInstance } from '../../../helpers/utils.js';
import { resetDOM } from '../../../helpers/reset.js';

afterEach(resetDOM);

describe.skipIf(process.env.NATIVE_SHADOW)('synthetic behavior', () => {
    const scenarios = [
        {
            Component: ParentAnyChildAny,
            tagName: 'c-parent-any-child-any',
            nativeLeaf: true,
        },
        {
            Component: ParentAnyChildReset,
            tagName: 'c-parent-any-child-reset',
            nativeLeaf: true,
        },
        {
            Component: ParentResetChildAny,
            tagName: 'c-parent-reset-child-any',
            nativeLeaf: true,
        },
        {
            Component: ParentResetChildReset,
            tagName: 'c-parent-reset-child-reset',
            nativeLeaf: false,
        },
        {
            Component: ParentLightChildAny,
            tagName: 'c-parent-light-child-any',
            nativeLeaf: true,
        },
        {
            Component: ParentLightChildReset,
            tagName: 'c-parent-light-child-reset',
            nativeLeaf: false,
        },
        {
            Component: GrandparentAnyParentAnyChildAny,
            tagName: 'c-grandparent-any-parent-any-child-any',
            nativeLeaf: true,
        },
        {
            Component: GrandparentAnyParentAnyChildReset,
            tagName: 'c-grandparent-any-parent-any-child-reset',
            nativeLeaf: true,
        },
        {
            Component: GrandparentAnyParentResetChildAny,
            tagName: 'c-grandparent-any-parent-reset-child-any',
            nativeLeaf: true,
        },
        {
            Component: GrandparentAnyParentResetChildReset,
            tagName: 'c-grandparent-any-parent-reset-child-reset',
            nativeLeaf: true,
        },
        {
            Component: GrandparentResetParentAnyChildAny,
            tagName: 'c-grandparent-reset-parent-any-child-any',
            nativeLeaf: true,
        },
        {
            Component: GrandparentResetParentAnyChildReset,
            tagName: 'c-grandparent-reset-parent-any-child-reset',
            nativeLeaf: true,
        },
        {
            Component: GrandparentResetParentResetChildAny,
            tagName: 'c-grandparent-reset-parent-reset-child-any',
            nativeLeaf: true,
        },
        {
            Component: GrandparentResetParentResetChildReset,
            tagName: 'c-grandparent-reset-parent-reset-child-reset',
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
