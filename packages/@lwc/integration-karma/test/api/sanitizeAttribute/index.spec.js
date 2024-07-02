import { createElement } from 'lwc';

import XlinkStatic from 'x/xlinkStatic';
import XlinkDynamic from 'x/xlinkDynamic';
import XlinkBooleanTrue from 'x/xlinkBooleanTrue';
import HrefStatic from 'x/hrefStatic';
import HrefDynamic from 'x/hrefDynamic';
import HrefBooleanTrue from 'x/hrefBooleanTrue';

const scenarios = [
    {
        type: 'static',
        attrName: 'xlink:href',
        tagName: 'x-xlink-static',
        Ctor: XlinkStatic,
    },
    {
        type: 'dynamic',
        attrName: 'xlink:href',
        tagName: 'x-xlink-dynamic',
        Ctor: XlinkDynamic,
    },
    {
        type: 'static',
        attrName: 'href',
        tagName: 'x-href-static',
        Ctor: HrefStatic,
    },
    {
        type: 'dynamic',
        attrName: 'href',
        tagName: 'x-href-dynamic',
        Ctor: HrefDynamic,
    },
];

scenarios.forEach(({ type, attrName, tagName, Ctor }) => {
    describe(`${type} ${attrName}`, () => {
        const originalSanitizeAttribute = LWC.sanitizeAttribute;

        afterEach(() => {
            // Reset original sanitizer after each test.
            LWC.sanitizeAttribute = originalSanitizeAttribute;
        });

        it('uses the original passthrough sanitizer when not overridden', () => {
            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            const use = elm.shadowRoot.querySelector('use');
            expect(use.getAttribute(attrName)).toBe('/foo');
        });

        it('receives the right parameters', () => {
            spyOn(LWC, 'sanitizeAttribute');

            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            expect(LWC.sanitizeAttribute).toHaveBeenCalledWith(
                'use',
                'http://www.w3.org/2000/svg',
                attrName,
                '/foo'
            );
        });

        it('replace the original attribute value with a string', () => {
            spyOn(LWC, 'sanitizeAttribute').and.returnValue('/bar');

            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            const use = elm.shadowRoot.querySelector('use');
            expect(use.getAttribute(attrName)).toBe('/bar');
        });

        it('replace the original attribute value with undefined', () => {
            spyOn(LWC, 'sanitizeAttribute').and.returnValue(undefined);

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
        tagName: 'x-xlink-boolean-true',
        Ctor: XlinkBooleanTrue,
    },
    {
        attrName: 'href',
        tagName: 'x-href-boolean-true',
        Ctor: HrefBooleanTrue,
    },
];

booleanTrueScenarios.forEach(({ attrName, tagName, Ctor }) => {
    describe(attrName, () => {
        // For boolean literals (e.g. `<use xlink:href>`), there is no reason to sanitize since it's empty
        it('does not sanitize when used as a boolean-true attribute', () => {
            spyOn(LWC, 'sanitizeAttribute');

            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            const use = elm.shadowRoot.querySelector('use');
            expect(use.getAttribute(attrName)).toBe('');

            expect(LWC.sanitizeAttribute).not.toHaveBeenCalled();
        });
    });
});
