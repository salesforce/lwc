import { createElement, setFeatureFlagForTest } from 'lwc';
import Container from 'x/container';
import Escape from 'x/escape';
import MultipleStyles from 'x/multipleStyles';
import SvgNs from 'x/svgNs';
import Table from 'x/table';

// In compat mode, the component will always render in synthetic mode with the scope attribute
if (!process.env.NATIVE_SHADOW && !process.env.COMPAT) {
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
                const classList = Array.from(elm.shadowRoot.querySelector('div').classList).sort();
                expect(classList).toEqual(['foo', 'x-multipleStyles_b']);

                expect(() => {
                    elm.updateTemplate({
                        name: 'a',
                        useScopedCss: false,
                    });
                }).toLogErrorDev(stylesheetsWarning);
            })
            .then(() => {
                const classList = Array.from(elm.shadowRoot.querySelector('div').classList).sort();
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

describe('tables and static content', () => {
    it('should work with a static <td>', () => {
        const elm = createElement('x-table', { is: Table });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelectorAll('td').length).toEqual(0);

        elm.addRow();

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelectorAll('td').length).toEqual(1);
            expect(elm.shadowRoot.querySelector('td').textContent).toEqual('');
        });
    });
});

describe('template literal escaping', () => {
    it('should properly render escaped content', () => {
        const elm = createElement('x-escape', { is: Escape });
        document.body.appendChild(elm);

        // "`"
        [
            () => elm.shadowRoot.querySelector('.backtick-text').textContent,
            () => elm.shadowRoot.querySelector('.backtick-comment').firstChild.textContent,
            () => elm.shadowRoot.querySelector('.backtick-attr').getAttribute('data-message'),
        ].forEach((selector) => {
            expect(selector()).toBe('Escape `me`');
        });

        // "\`"
        [
            () => elm.shadowRoot.querySelector('.backtick-escape-text').textContent,
            () => elm.shadowRoot.querySelector('.backtick-escape-comment').firstChild.textContent,
            () =>
                elm.shadowRoot.querySelector('.backtick-escape-attr').getAttribute('data-message'),
        ].forEach((selector) => {
            expect(selector()).toBe('Escape \\`me`');
        });

        // "${"
        expect(elm.shadowRoot.querySelector('.dollar-attr').getAttribute('data-message')).toBe(
            'Escape ${me}'
        );

        // "\${"
        expect(
            elm.shadowRoot.querySelector('.dollar-escape-attr').getAttribute('data-message')
        ).toBe('Escape \\${me}');
    });
});
