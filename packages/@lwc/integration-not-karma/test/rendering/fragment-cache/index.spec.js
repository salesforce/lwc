import { createElement } from 'lwc';

import NativeScopedStyles from 'c/nativeScopedStyles';
import NativeStyles from 'c/nativeStyles';
import NoStyles from 'c/noStyles';
import ScopedStyles from 'c/scopedStyles';
import Styles from 'c/styles';
import { LOWERCASE_SCOPE_TOKENS } from '../../../helpers/constants.js';

const scenarios = [
    {
        name: 'no styles',
        Ctor: NoStyles,
        tagName: 'c-no-styles',
        expectedColor: 'rgb(0, 0, 0)',
        expectClass: false,
        expectAttribute: false,
    },
    {
        name: 'styles',
        Ctor: Styles,
        tagName: 'c-styles',
        expectedColor: 'rgb(255, 0, 0)',
        expectClass: false,
        expectAttribute: !process.env.NATIVE_SHADOW,
    },
    {
        name: 'scoped styles',
        Ctor: ScopedStyles,
        tagName: 'c-scoped-styles',
        expectedColor: 'rgb(0, 128, 0)',
        expectClass: true,
        expectAttribute: !process.env.NATIVE_SHADOW,
    },
    {
        name: 'native styles',
        Ctor: NativeStyles,
        tagName: 'c-native-styles',
        expectedColor: 'rgb(255, 0, 0)',
        expectClass: false,
        expectAttribute: false,
    },
    {
        name: 'native scoped styles',
        Ctor: NativeScopedStyles,
        tagName: 'c-native-scoped-styles',
        expectedColor: 'rgb(0, 128, 0)',
        expectClass: true,
        expectAttribute: false,
    },
];

// These tests confirm that the fragment cache (from `fragment-cache.ts`) is working correctly. Fragments should be
// unique based on 1) synthetic vs native shadow, and 2) presence or absence of scoped styles. If the fragment cache is
// not working correctly, then we may end up rendering the wrong styles or the wrong attribute/class scope token due to
// the cache being poisoned, e.g. an HTML string for scoped styles being rendered for non-scoped styles.
// To test this, we re-use the same `template.html` but change the `static stylesheets` in each component.
scenarios.forEach(({ name, Ctor, tagName, expectedColor, expectClass, expectAttribute }) => {
    describe(name, () => {
        let h1;

        beforeEach(async () => {
            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);
            await Promise.resolve();
            h1 = elm.shadowRoot.querySelector('h1');
        });

        it('renders the correct styles', () => {
            expect(getComputedStyle(h1).color).toBe(expectedColor);
        });

        it('renders the correct attributes/classes', () => {
            const scopeToken = LOWERCASE_SCOPE_TOKENS ? 'lwc-2it5vhebv0i' : 'c-template_template';

            expect(h1.getAttribute('class')).toBe(expectClass ? scopeToken : null);
            expect(h1.hasAttribute(scopeToken)).toBe(expectAttribute);
        });
    });
});
