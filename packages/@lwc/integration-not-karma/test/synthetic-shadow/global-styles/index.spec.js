import { createElement } from 'lwc';
import Component from 'x/component';

// TODO [#2922]: remove this test when we can support document.adoptedStyleSheets.
// Currently we can't, due to backwards compat.

describe.skipIf(process.env.NATIVE_SHADOW)('global styles', () => {
    it('injects global styles in document.head in synthetic shadow', () => {
        const numStyleSheetsBefore = document.styleSheets.length;
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const numStyleSheetsAfter = document.styleSheets.length;
            expect(numStyleSheetsBefore + 1).toEqual(numStyleSheetsAfter);
        });
    });
});
