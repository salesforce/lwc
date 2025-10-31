import { createElement } from 'lwc';

import SimpleParent from 'c/simpleParent';
import SlottedParent from 'c/slotted';
import SlottedCustomElement from 'c/slottedCustomElement';
import SlotReceiver from 'c/slot';
import CustomElementAsDefaultSlot from 'c/customElementAsDefaultSlot';
import TextSlotted from 'c/textSlotted';
import { getHostChildNodes } from '../../../helpers/utils.js';

describe('assignedSlot', () => {
    it('should return null when custom element is not in slot', () => {
        const elm = createElement('c-assigned-slot', { is: SimpleParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('c-no-slot');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when native element is not in slot', () => {
        const elm = createElement('c-assigned-slot', { is: SimpleParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return the correct slot when native element is slotted', () => {
        const elm = createElement('c-native-slotted-component', { is: SlottedParent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('c-slot').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return the correct slot when custom element is slotted', () => {
        const elm = createElement('c-custom-slotted-component', { is: SlottedCustomElement });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('c-slot').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('c-child');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return the correct named slot when native element is slotted', () => {
        const elm = createElement('c-native-slotted-component', { is: SlottedParent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('c-named-slot').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('div.named');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return the correct named slot when custom element is slotted', () => {
        const elm = createElement('c-custom-slotted-component', { is: SlottedCustomElement });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('c-named-slot').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('c-child.named');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return the correct slot when text is slotted', () => {
        const elm = createElement('c-native-slotted-component', { is: TextSlotted });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('c-slot').shadowRoot.querySelector('slot');
        const text = getHostChildNodes(elm.shadowRoot.querySelector('c-slot'))[0];
        expect(text.assignedSlot).toBe(slot);
    });

    it('should return null when native element default slot content', () => {
        const elm = createElement('c-assigned-slot', { is: SlotReceiver });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when custom element default slot content', () => {
        const elm = createElement('c-assigned-slot', { is: CustomElementAsDefaultSlot });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('c-child');
        expect(child.assignedSlot).toBe(null);
    });
});
