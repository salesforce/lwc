import { createElement } from 'lwc';

import Test from 'c/test';

describe('ShadowRoot.innerHTML', () => {
    it('get - should enforce the shadow DOM semantic', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.innerHTML).toBe('<c-container><div>Slotted Text</div></c-container>');
        expect(elm.shadowRoot.querySelector('c-container').shadowRoot.innerHTML).toBe(
            '<div>Before[<slot></slot>]After</div>'
        );
    });

    it('should throw an error when invoking setter on the shadowRoot', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(() => {
            elm.shadowRoot.innerHTML = '<span>Hello World!</span>';
        }).toLogErrorDev(/Invalid attempt to set innerHTML on ShadowRoot/);
    });
});
