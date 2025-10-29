/**
 * The URLs used in test are handled by the `serve` method defined in `serve-integration.js`.
 * What they serve doesn't matter, it's just to avoid a 404 warning logged to console
 */
import {
    createElement,
    // Spy is created in a mock file and injected with the import map plugin
    sanitizeAttribute as sanitizeAttributeSpy,
} from 'lwc';

import XlinkStatic from 'c/xlinkStatic';
import XlinkDynamic from 'c/xlinkDynamic';
import XlinkBooleanTrue from 'c/xlinkBooleanTrue';
import HrefStatic from 'c/hrefStatic';
import HrefDynamic from 'c/hrefDynamic';
import HrefBooleanTrue from 'c/hrefBooleanTrue';

const scenarios = [
    {
        type: 'static',
        attrName: 'xlink:href',
        tagName: 'c-xlink-static',
        Ctor: XlinkStatic,
    },
    {
        type: 'dynamic',
        attrName: 'xlink:href',
        tagName: 'c-xlink-dynamic',
        Ctor: XlinkDynamic,
    },
    {
        type: 'static',
        attrName: 'href',
        tagName: 'c-href-static',
        Ctor: HrefStatic,
    },
    {
        type: 'dynamic',
        attrName: 'href',
        tagName: 'c-href-dynamic',
        Ctor: HrefDynamic,
    },
];

scenarios.forEach(({ type, attrName, tagName, Ctor }) => {
    describe(`${type} ${attrName}`, () => {
        afterEach(() => {
            sanitizeAttributeSpy.mockReset();
        });

        it('uses the original passthrough sanitizer when not overridden', () => {
            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            const use = elm.shadowRoot.querySelector('use');
            expect(use.getAttribute(attrName)).toBe('/test_api_sanitizeAttribute?foo');
        });

        it('receives the right parameters', () => {
            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            expect(sanitizeAttributeSpy).toHaveBeenCalledWith(
                'use',
                'http://www.w3.org/2000/svg',
                attrName,
                '/test_api_sanitizeAttribute?foo'
            );
        });

        it('replace the original attribute value with a string', () => {
            sanitizeAttributeSpy.mockReturnValue('/test_api_sanitizeAttribute?bar');

            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            const use = elm.shadowRoot.querySelector('use');
            expect(use.getAttribute(attrName)).toBe('/test_api_sanitizeAttribute?bar');
        });

        it('replace the original attribute value with undefined', () => {
            sanitizeAttributeSpy.mockReturnValue(undefined);

            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            // sanity check to make sure returning `undefined` works correctly here
            const use = elm.shadowRoot.querySelector('use');
            expect(use.hasAttribute(attrName)).toBe(false);
        });
    });
});

const booleanTrueScenarios = [
    {
        attrName: 'xlink:href',
        tagName: 'c-xlink-boolean-true',
        Ctor: XlinkBooleanTrue,
    },
    {
        attrName: 'href',
        tagName: 'c-href-boolean-true',
        Ctor: HrefBooleanTrue,
    },
];

booleanTrueScenarios.forEach(({ attrName, tagName, Ctor }) => {
    describe(attrName, () => {
        // For boolean literals (e.g. `<use xlink:href>`), there is no reason to sanitize since it's empty
        it('does not sanitize when used as a boolean-true attribute', () => {
            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            const use = elm.shadowRoot.querySelector('use');
            expect(use.getAttribute(attrName)).toBe('');

            expect(sanitizeAttributeSpy).not.toHaveBeenCalled();
        });
    });
});
