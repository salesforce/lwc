import { createElement } from 'lwc';
import Component from 'x/component';

if (!process.env.NATIVE_SHADOW) {
    describe('global styles', () => {
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
}
