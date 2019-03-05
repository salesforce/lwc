import { createElement } from 'test-utils';

import Slotted from 'x/slotted';

describe('Node.textContent - getter', () => {
    it('should enforce the shadow DOM semantic - x-test', () => {
        const elm = createElement('x-test', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.textContent).toBe('');
        expect(elm.shadowRoot.textContent).toBe('Slotted Text');
        expect(elm.shadowRoot.querySelector('x-container').textContent).toBe('Slotted Text');
        expect(elm.shadowRoot.querySelector('.slotted').textContent).toBe('Slotted Text');
    });

    it('should enforce the shadow DOM semantic - x-container', () => {
        const elm = createElement('x-test', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        expect(container.shadowRoot.textContent).toBe(
            process.env.NATIVE_SHADOW ? 'Before[default-slotted]After' : 'Before[]After'
        );
        expect(container.shadowRoot.querySelector('slot').textContent).toBe(
            process.env.NATIVE_SHADOW ? 'default-slotted' : ''
        );
    });
});

describe('Node.textContent - setter', () => {
    // TODO - #990 no error is thrown when invoking textContent on the host element
    xit('should throw when invoking setter on the host element', () => {
        const elm = createElement('x-test', { is: Slotted });
        document.body.appendChild(elm);

        expect(() => {
            elm.shadowRoot.textContent = '<span>Hello World!</span>';
        }).toThrowError();
    });

    it('should log an error when invoking setter for an element in the shadow', () => {
        const elm = createElement('x-test', { is: Slotted });
        document.body.appendChild(elm);

        const div = elm.shadowRoot.querySelector('div');

        expect(() => {
            div.textContent = '<span>Hello World!</span>';
        }).toLogErrorDev(
            /\[LWC error\]: textContent is disallowed in Element unless `lwc:dom="manual"` directive is used in the template./
        );
    });
});
