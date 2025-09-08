import { createElement } from 'lwc';

import ComplexSlotted from 'x/complexSlotted';

describe('Node.compareDocumentPosition', () => {
    it('should return the right value for node outside the shadow tree', () => {
        const elm = createElement('x-slotted', { is: ComplexSlotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;

        expect(
            elm.compareDocumentPosition(shadowRoot) & Node.DOCUMENT_POSITION_DISCONNECTED
        ).not.toBe(0);
        expect(
            elm.compareDocumentPosition(shadowRoot) & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        ).not.toBe(0);

        expect(
            shadowRoot.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED
        ).not.toBe(0);
        expect(
            shadowRoot.compareDocumentPosition(document) &
                Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        ).not.toBe(0);
        expect(
            shadowRoot.compareDocumentPosition(elm) & Node.DOCUMENT_POSITION_DISCONNECTED
        ).not.toBe(0);
        expect(
            shadowRoot.compareDocumentPosition(elm) & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        ).not.toBe(0);
    });

    it('should return the right value for nodes in the same shadow tree', () => {
        const elm = createElement('x-slotted', { is: ComplexSlotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;

        const before = shadowRoot.querySelector('.before');
        const after = shadowRoot.querySelector('.after');
        const outer = shadowRoot.querySelector('.outer');
        const xContainer = shadowRoot.querySelector('x-container');
        const slotted = shadowRoot.querySelector('.slotted');

        expect(shadowRoot.compareDocumentPosition(before)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(shadowRoot.compareDocumentPosition(shadowRoot)).toBe(0);
        expect(shadowRoot.compareDocumentPosition(outer)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(shadowRoot.compareDocumentPosition(xContainer)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(shadowRoot.compareDocumentPosition(slotted)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(shadowRoot.compareDocumentPosition(after)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );

        expect(outer.compareDocumentPosition(before)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
        expect(outer.compareDocumentPosition(shadowRoot)).toBe(
            Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
        );
        expect(outer.compareDocumentPosition(outer)).toBe(0);
        expect(outer.compareDocumentPosition(xContainer)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(outer.compareDocumentPosition(slotted)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(outer.compareDocumentPosition(after)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

        expect(xContainer.compareDocumentPosition(before)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
        expect(xContainer.compareDocumentPosition(shadowRoot)).toBe(
            Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
        );
        expect(xContainer.compareDocumentPosition(outer)).toBe(
            Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
        );
        expect(xContainer.compareDocumentPosition(xContainer)).toBe(0);
        expect(xContainer.compareDocumentPosition(slotted)).toBe(
            Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(xContainer.compareDocumentPosition(after)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

        expect(slotted.compareDocumentPosition(before)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
        expect(slotted.compareDocumentPosition(shadowRoot)).toBe(
            Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
        );
        expect(slotted.compareDocumentPosition(outer)).toBe(
            Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
        );
        expect(slotted.compareDocumentPosition(xContainer)).toBe(
            Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
        );
        expect(slotted.compareDocumentPosition(slotted)).toBe(0);
        expect(slotted.compareDocumentPosition(after)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('should return the right value for slotted node', () => {
        const elm = createElement('x-slotted', { is: ComplexSlotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        const slot = container.shadowRoot.querySelector('slot');
        const slotted = elm.shadowRoot.querySelector('.slotted');

        expect(
            slot.compareDocumentPosition(slotted) & Node.DOCUMENT_POSITION_DISCONNECTED
        ).not.toBe(0);
        expect(
            slot.compareDocumentPosition(slotted) & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        ).not.toBe(0);
    });
});
