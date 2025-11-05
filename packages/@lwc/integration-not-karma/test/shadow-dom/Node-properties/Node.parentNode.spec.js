import { createElement } from 'lwc';

import Slotted from 'x/slotted';
import Container from 'x/container';

describe('Node.parentNode', () => {
    it('should return the parent element when accessing parentNode if it exists', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('x-container').parentNode).toBe(
            elm.shadowRoot.querySelector('.outer')
        );
    });

    it('should return the shadowRoot when accessing parentNode from an element at the root of the shadow tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.outer').parentNode).toBe(elm.shadowRoot);
    });

    it('should return the right parent node for slotted nodes', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.slotted').parentNode).toBe(
            elm.shadowRoot.querySelector('x-container')
        );
    });

    it('should return the right parent node for fallback slot nodes', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.default-slotted').parentNode).toBe(
            elm.shadowRoot.querySelector('slot')
        );
    });

    it('should return the shadowRoot on the first child', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.firstChild.parentNode).toBe(elm.shadowRoot);
    });
});
