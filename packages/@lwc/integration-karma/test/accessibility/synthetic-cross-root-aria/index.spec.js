import { createElement } from 'lwc';
import AriaContainer from 'x/ariaContainer';

// These tests are designed to detect non-standard cross-root ARIA usage in synthetic shadow DOM
if (!process.env.NATIVE_SHADOW) {
    describe('synthetic shadow cross-root ARIA', () => {
        it('can detect setting aria-labelledby', () => {
            const elm = createElement('x-aria-container', { is: AriaContainer });
            document.body.appendChild(elm);
            expect(() => {
                elm.linkUsingAriaLabelledBy();
            }).toLogErrorDev(
                /Element <input> is using attribute "aria-labelledby" to reference element <label>, which is not in the same shadow root\. This will break in native shadow DOM\./
            );
        });
    });
}
