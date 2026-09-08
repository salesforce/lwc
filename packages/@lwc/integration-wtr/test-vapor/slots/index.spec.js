import { createElement } from 'lwc';
import Parent from 'x/parent';

describe('vapor: slots', () => {
    it('distributes named and default slot content (native shadow projection)', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const panel = elm.shadowRoot.querySelector('x-panel');

        // In native shadow, slotted content lives in the panel's LIGHT DOM and the
        // browser projects it into the matching <slot>. Verify via assignedNodes().
        const titleSlot = panel.shadowRoot.querySelector('slot[name="title"]');
        const defaultSlot = panel.shadowRoot.querySelector('slot:not([name])');

        const titleAssigned = titleSlot.assignedNodes().map((n) => n.textContent);
        const defaultAssigned = defaultSlot.assignedNodes().map((n) => n.textContent);

        expect(titleAssigned.join('')).toContain('The Title');
        expect(defaultAssigned.join('')).toContain('Body content');
    });
});
