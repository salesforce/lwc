import { createElement } from 'lwc';

import Slotted from 'c/slotted';
import Container from 'c/container';

describe('Node.parentElement', () => {
    it('should return the parent element if it exists', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('c-container').parentElement).toBe(
            elm.shadowRoot.querySelector('.outer')
        );
    });

    it('should return null when retrieving parentElement from an element at the root of the shadow tree', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.outer').parentElement).toBe(null);
    });

    it('should return the right parent element when node is slotted', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.slotted').parentElement).toBe(
            elm.shadowRoot.querySelector('c-container')
        );
    });

    it('should return the right parent element for fallback slot nodes', () => {
        const elm = createElement('c-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.default-slotted').parentElement).toBe(
            elm.shadowRoot.querySelector('slot')
        );
    });

    it('should return null for the shadowRoot first child', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.firstChild.parentElement).toBe(null);
    });
});
