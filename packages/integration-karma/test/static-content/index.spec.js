import { createElement, setFeatureFlagForTest } from 'lwc';
import Container from './x/container/container';
import MultipleStyles from './x/multipleStyles/multipleStyles';

if (!process.env.NATIVE_SHADOW && !process.env.COMPAT) {
    /* compat will have the token when rendering in native*/ describe('Mixed mode for static content', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
        });
        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
        });

        ['native', 'synthetic'].forEach((firstRenderMode) => {
            it(`should set the tokens for synthetic shadow when it renders first in ${firstRenderMode}`, () => {
                const elm = createElement('x-container', { is: Container });
                elm.syntheticFirst = firstRenderMode === 'synthetic';
                document.body.appendChild(elm);

                const syntheticMode = elm.shadowRoot
                    .querySelector('x-component')
                    .shadowRoot.querySelector('div');
                const nativeMode = elm.shadowRoot
                    .querySelector('x-native')
                    .shadowRoot.querySelector('x-component')
                    .shadowRoot.querySelector('div');

                expect(syntheticMode.hasAttribute('x-component_component')).toBe(true);
                expect(nativeMode.hasAttribute('x-component_component')).toBe(false);
            });
        });
    });
}

describe('static content when stylesheets change', () => {
    it('should reflect correct token for scoped styles', () => {
        const elm = createElement('x-container', { is: MultipleStyles });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe('foo');

        // atm, we need to switch templates.
        elm.tpl = 'b';
        elm.useScopeCss = true;

        return Promise.resolve()
            .then(() => {
                expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe(
                    'foo x-multipleStyles_b'
                );
                elm.tpl = 'a';
                elm.useScopeCss = false;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe('foo');
            });
    });
});
