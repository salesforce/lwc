import { createElement } from 'lwc';

import Test from 'x/test';

function stripDataMarker(str) {
    // Strip the node-reactions marker
    return str.replace(/ data-node-reactions(="")*/gm, '');
}

describe('ShadowRoot.innerHTML', () => {
    it('get - should enforce the shadow DOM semantic', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(stripDataMarker(elm.shadowRoot.innerHTML)).toBe(
            '<x-container><div>Slotted Text</div></x-container>'
        );
        expect(elm.shadowRoot.querySelector('x-container').shadowRoot.innerHTML).toBe(
            '<div>Before[<slot></slot>]After</div>'
        );
    });

    // TODO - #991 No error is thrown when invoking
    xit('should throw an error when invoking setter on the shadowRoot', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(() => {
            elm.shadowRoot.innerHTML = '<span>Hello World!</span>';
        }).toThrowError();
    });
});
