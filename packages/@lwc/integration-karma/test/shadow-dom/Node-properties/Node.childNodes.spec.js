import { createElement } from 'lwc';
import { getHostChildNodes } from 'test-utils';

import Slotted from 'x/slotted';
import SlottedParent from 'x/slottedParent';
import TextSlottedParent from 'x/textSlottedParent';
import UnslottedParent from 'x/unslottedParent';
import HasNoSlot from 'x/hasNoSlot';
import Parent from 'x/parent';
import SimpleParent from 'x/simpleParent';

describe('Node.childNodes', () => {
    it('should return the right children Nodes - x-slotted', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const hostChildNodes = getHostChildNodes(elm);
        expect(hostChildNodes.length).toBe(0);

        expect(elm.shadowRoot.childNodes.length).toBe(1);
        expect(elm.shadowRoot.childNodes[0]).toBe(elm.shadowRoot.querySelector('.outer'));

        expect(elm.shadowRoot.querySelector('.slotted').childNodes.length).toBe(1);
        expect(elm.shadowRoot.querySelector('.slotted').childNodes[0].nodeType).toBe(
            Node.TEXT_NODE
        );
        expect(elm.shadowRoot.querySelector('.slotted').childNodes[0].textContent).toBe(
            'Slotted Text'
        );
    });

    it('should return the right children Nodes - x-container', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');

        const hostChildNodes = getHostChildNodes(container);
        expect(hostChildNodes.length).toBe(1);
        expect(hostChildNodes[0]).toBe(elm.shadowRoot.querySelector('.slotted'));

        expect(container.shadowRoot.childNodes.length).toBe(3);
        expect(container.shadowRoot.childNodes[1]).toBe(
            container.shadowRoot.querySelector('.container')
        );

        // With native shadow the fallback slot content is rendered regardless if the slot has assigned nodes or not.
        // While with synthetic shadow, the fallback slot content is only rendered only when the slot has no assigned
        // nodes.
        expect(container.shadowRoot.querySelector('slot').childNodes.length).toBe(
            process.env.NATIVE_SHADOW ? 1 : 0
        );
    });

    // TODO [#1761]: Difference in behavior of slot.childNodes in native and synthetic-shadow
    // enable this test in synthetic-shadow mode once the bug is fixed
    if (process.env.NATIVE_SHADOW) {
        it('should always return an default content for slots not rendering default content', () => {
            const elm = createElement('x-slotted-parent', { is: SlottedParent });
            document.body.appendChild(elm);
            const slot = elm.shadowRoot
                .querySelector('x-has-slot')
                .shadowRoot.querySelector('slot');
            // Per spec, slot elements will retain default content
            expect(slot.childNodes.length).toBe(1);
            expect(slot.assignedNodes().length).toBe(2);
        });
    }

    it('should return correct elements for slots rendering default content', () => {
        const elm = createElement('x-unslotted-parent', { is: UnslottedParent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-has-slot').shadowRoot.querySelector('slot');
        expect(slot.childNodes.length).toBe(1);
    });

    it('should return correct elements for non-slot elements', () => {
        const elm = createElement('x-has-no-slot', { is: HasNoSlot });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        const childNodes = getHostChildNodes(child);
        expect(childNodes.length).toBe(1);
        expect(childNodes[0]).toBe(elm.shadowRoot.querySelector('p'));
    });

    it('should return correct elements for custom elements when no children present', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-has-no-slot');
        const childNodes = getHostChildNodes(child);
        expect(childNodes.length).toBe(0);
    });

    it('should return correct elements for custom elements when children present', () => {
        const elm = createElement('x-slotted-parent', { is: SlottedParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-has-slot');
        const childNodes = getHostChildNodes(child);
        expect(childNodes.length).toBe(2);
    });

    it('should return child text content passed via slot', () => {
        const elm = createElement('x-parent', { is: TextSlottedParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-has-slot');
        const childNodes = getHostChildNodes(child);
        expect(childNodes.length).toBe(1);
        expect(childNodes[0].nodeType).toBe(3);
        expect(childNodes[0].textContent).toBe('text');
    });

    it('should not return child text from within template', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-text');
        const childNodes = getHostChildNodes(child);
        expect(childNodes.length).toBe(0);
    });

    it('should not return dynamic child text from within template', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = getHostChildNodes(elm.shadowRoot.querySelector('x-dynamic-text'));
        expect(childNodes.length).toBe(0);
    });

    it('should return correct childNodes from shadowRoot', () => {
        const elm = createElement('x-parent', { is: SimpleParent });
        document.body.appendChild(elm);
        const childNodes = elm.shadowRoot.childNodes;
        expect(childNodes.length).toBe(2);
        expect(childNodes[0]).toBe(elm.shadowRoot.querySelector('div'));
        expect(childNodes[1].nodeType).toBe(3);
        expect(childNodes[1].textContent).toBe('text');
    });
});
