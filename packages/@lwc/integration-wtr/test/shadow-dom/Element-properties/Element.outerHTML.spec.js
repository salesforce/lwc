import { createElement } from 'lwc';

import Test from 'x/test';

describe('Element.outerHTML - get', () => {
    it('should enforce the shadow DOM semantic - x-test', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.outerHTML).toBe('<x-test></x-test>');
        expect(elm.shadowRoot.querySelector('x-container').outerHTML).toBe(
            '<x-container><div>Slotted Text<input name="slotted"></div></x-container>'
        );
        expect(elm.shadowRoot.querySelector('div').outerHTML).toBe(
            '<div>Slotted Text<input name="slotted"></div>'
        );
    });

    it('should enforce the shadow DOM semantic - x-container', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        expect(container.shadowRoot.querySelector('div').outerHTML).toBe(
            '<div class="container">Before[<slot></slot>]After</div>'
        );
        expect(container.shadowRoot.querySelector('slot').outerHTML).toBe('<slot></slot>');
    });
});

describe('Element.outerHTML - set', () => {
    it('should throw when invoking setter on the host element', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(() => {
            elm.outerHTML = '<span>Hello World!</span>';
        }).toLogErrorDev(/Invalid attempt to set outerHTML on HTMLElement/);
    });

    it('should log an error when invoking setter for an element in the shadow', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(() => {
            const div = elm.shadowRoot.querySelector('div');
            div.outerHTML = '<span>Hello World!</span>';
        }).toLogErrorDev(/Invalid attempt to set outerHTML on Element/);
    });
});
