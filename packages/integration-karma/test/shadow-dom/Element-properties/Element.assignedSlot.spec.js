import { createElement } from 'lwc';

import SimpleParent from 'x/simpleParent';
import SlottedParent from 'x/slotted';
import SlottedCustomElement from 'x/slottedCustomElement';
import SlotReceiver from 'x/slot';
import CustomElementAsDefaultSlot from 'x/customElementAsDefaultSlot';
import TextSlotted from 'x/textSlotted';

describe('assignedSlot', () => {
    it('should return null when custom element is not in slot', () => {
        const elm = createElement('x-assigned-slot', { is: SimpleParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-no-slot');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when native element is not in slot', () => {
        const elm = createElement('x-assigned-slot', { is: SimpleParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when native element is slotted', () => {
        const elm = createElement('x-native-slotted-component', { is: SlottedParent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-slot').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return correct slot when custom element is slotted', () => {
        const elm = createElement('x-native-slotted-component', { is: SlottedCustomElement });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-slot').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('x-child');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return null when native element default slot content', () => {
        const elm = createElement('x-assigned-slot', { is: SlotReceiver });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when custom element default slot content', () => {
        const elm = createElement('x-assigned-slot', { is: CustomElementAsDefaultSlot });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when text is slotted', () => {
        const elm = createElement('x-native-slotted-component', { is: TextSlotted });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-slot').shadowRoot.querySelector('slot');
        const text = elm.shadowRoot.querySelector('x-slot').childNodes[0];
        expect(text.assignedSlot).toBe(slot);
    });
});
