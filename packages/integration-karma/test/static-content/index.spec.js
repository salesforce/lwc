import { createElement, setFeatureFlagForTest } from 'lwc';
import Container from './x/container/container';
import MultipleStyles from './x/multipleStyles/multipleStyles';
import SvgNs from './x/svgNs/svgNs';

describe('static content', () => {
    if (!process.env.NATIVE_SHADOW && !process.env.COMPAT) {
        /* compat will have the token when rendering in native*/
        describe('Mixed mode for static content', () => {
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

            const stylesheetsWarning =
                /Dynamically setting the "stylesheets" property on a template function is deprecated and may be removed in a future version of LWC./;

            expect(() => {
                elm.updateTemplate({
                    name: 'a',
                    useScopedCss: false,
                });
            }).toLogErrorDev(stylesheetsWarning);

            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe('foo');

            // atm, we need to switch templates.
            expect(() => {
                elm.updateTemplate({
                    name: 'b',
                    useScopedCss: true,
                });
            }).toLogErrorDev(stylesheetsWarning);

            return Promise.resolve()
                .then(() => {
                    const classList = Array.from(
                        elm.shadowRoot.querySelector('div').classList
                    ).sort();
                    expect(classList).toEqual(['foo', 'x-multipleStyles_b']);

                    expect(() => {
                        elm.updateTemplate({
                            name: 'a',
                            useScopedCss: false,
                        });
                    }).toLogErrorDev(stylesheetsWarning);
                })
                .then(() => {
                    const classList = Array.from(
                        elm.shadowRoot.querySelector('div').classList
                    ).sort();
                    expect(classList).toEqual(['foo']);
                });
        });
    });

    describe('svg and static content', () => {
        it('should use correct namespace', () => {
            const elm = createElement('x-svg-ns', { is: SvgNs });
            document.body.appendChild(elm);

            const allStaticNodes = elm.querySelectorAll('.static');

            allStaticNodes.forEach((node) => {
                expect(node.namespaceURI).toBe('http://www.w3.org/2000/svg');
            });
        });
    });
});
