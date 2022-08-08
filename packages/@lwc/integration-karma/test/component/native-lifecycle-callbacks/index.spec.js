import { createElement } from 'lwc';
import LwcReserved from 'x/lwcReserved';

if (window.lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
    describe('native lifecycle callbacks', () => {
        it('throws in connectedCallback/disconnectedCallback for manually-created element with tag name reserved by LWC', () => {
            const lwcElm = createElement('lwc-already-reserved-this-tag-name', { is: LwcReserved });
            document.body.appendChild(lwcElm);

            const expectedMessage =
                'Error: [LWC error]: VM for tagName lwc-already-reserved-this-tag-name is undefined. ' +
                'This indicates that an element was created with this tagName, which is already reserved ' +
                'by an LWC component. Use lwc.createElement instead to create elements.';

            const elm = document.createElement('lwc-already-reserved-this-tag-name');

            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(expectedMessage);

            expect(() => {
                document.body.removeChild(elm);
            }).toLogErrorDev(expectedMessage);
        });
    });
}
