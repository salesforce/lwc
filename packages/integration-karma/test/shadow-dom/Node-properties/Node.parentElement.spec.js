import { createElement } from 'lwc';

import Slotted from 'x/slotted';
import Container from 'x/container';

describe('Node.parentElement', () => {
    it('should return the parent element if it exists', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('x-container').parentElement).toBe(
            elm.shadowRoot.querySelector('.outer')
        );
    });

    it('should return null when retrieving parentElement from an element at the root of the shadow tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.outer').parentElement).toBe(null);
    });

    it('should return the right parent element when node is slotted', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.slotted').parentElement).toBe(
            elm.shadowRoot.querySelector('x-container')
        );
    });

    it('should return the right parent element for fallback slot nodes', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.default-slotted').parentElement).toBe(
            elm.shadowRoot.querySelector('slot')
        );
    });

    it('should return null for the shadowRoot first child', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.firstChild.parentElement).toBe(null);
    });
});
