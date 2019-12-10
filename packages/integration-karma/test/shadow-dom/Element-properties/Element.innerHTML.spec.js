import { createElement } from 'lwc';

import Test from 'x/test';

describe('Element.innerHTML - get', () => {
    it('should enforce the shadow DOM semantic - x-test', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.innerHTML).toBe('');
        expect(elm.shadowRoot.querySelector('x-container').innerHTML).toBe(
            '<div>Slotted Text<input name="slotted"></div>'
        );
        expect(elm.shadowRoot.querySelector('div').innerHTML).toBe(
            'Slotted Text<input name="slotted">'
        );
    });

    it('should enforce the shadow DOM semantic - x-container', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        expect(container.shadowRoot.querySelector('div').innerHTML).toBe(
            'Before[<slot></slot>]After'
        );
        expect(container.shadowRoot.querySelector('slot').innerHTML).toBe('');
    });
});

describe('Element.innerHTML - set', () => {
    // TODO [#990]: No error is thrown when invoking innerHTML on the host element
    xit('should throw when invoking setter on the host element', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(() => {
            elm.innerHTML = '<span>Hello World!</span>';
        }).toThrowError();
    });

    it('should log an error when invoking setter for an element in the shadow', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const div = elm.shadowRoot.querySelector('div');

        expect(() => {
            div.innerHTML = '<span>Hello World!</span>';
        }).toLogErrorDev(
            /\[LWC error\]: The `innerHTML` property is available only on elements that use the `lwc:dom="manual"` directive./
        );
    });
});
