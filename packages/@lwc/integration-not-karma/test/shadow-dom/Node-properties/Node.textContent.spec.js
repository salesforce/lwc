import { createElement } from 'lwc';

import Slotted from 'c/slotted';

describe('Node.textContent - getter', () => {
    it('should enforce the shadow DOM semantic - c-test', () => {
        const elm = createElement('c-test', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.textContent).toBe('');
        expect(elm.shadowRoot.textContent).toBe('Slotted Text');
        expect(elm.shadowRoot.querySelector('c-container').textContent).toBe('Slotted Text');
        expect(elm.shadowRoot.querySelector('.slotted').textContent).toBe('Slotted Text');
    });

    it('should enforce the shadow DOM semantic - c-container', () => {
        const elm = createElement('c-test', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('c-container');
        expect(container.shadowRoot.textContent).toBe(
            process.env.NATIVE_SHADOW ? 'Before[default-slotted]After' : 'Before[]After'
        );
        expect(container.shadowRoot.querySelector('slot').textContent).toBe(
            process.env.NATIVE_SHADOW ? 'default-slotted' : ''
        );
    });
});

describe('Node.textContent - setter', () => {
    it('should throw when invoking setter on the host element', () => {
        const elm = createElement('c-test', { is: Slotted });
        document.body.appendChild(elm);

        expect(() => {
            elm.shadowRoot.textContent = '<span>Hello World!</span>';
        }).toLogErrorDev(/Invalid attempt to set textContent on ShadowRoot/);
    });

    it('should log a warning when invoking setter for an element in the shadow only in synthetic mode', () => {
        const elm = createElement('c-test', { is: Slotted });
        document.body.appendChild(elm);

        const div = elm.shadowRoot.querySelector('div');

        // eslint-disable-next-line vitest/valid-expect
        let expected = expect(() => {
            div.textContent = '<span>Hello World!</span>';
        });
        if (process.env.NATIVE_SHADOW) {
            expected = expected.not; // no error
        }
        expected.toLogWarningDev(
            /\[LWC warn\]: The `textContent` property is available only on elements that use the `lwc:dom="manual"` directive./
        );
    });
});
