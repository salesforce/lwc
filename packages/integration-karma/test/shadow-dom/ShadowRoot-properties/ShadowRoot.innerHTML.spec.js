import { createElement } from 'lwc';

import Test from 'x/test';

describe('ShadowRoot.innerHTML', () => {
    it('get - should enforce the shadow DOM semantic', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.innerHTML).toBe('<x-container><div>Slotted Text</div></x-container>');
        expect(elm.shadowRoot.querySelector('x-container').shadowRoot.innerHTML).toBe(
            '<div>Before[<slot></slot>]After</div>'
        );
    });

    it('should throw an error when invoking setter on the shadowRoot', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(() => {
            elm.shadowRoot.innerHTML = '<span>Hello World!</span>';
        }).toThrowError();
    });
});
