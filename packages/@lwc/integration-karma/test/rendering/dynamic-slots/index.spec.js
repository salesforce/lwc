import { createElement } from 'lwc';
import Parent from 'x/parent';
import LightParent from 'x/lightParent';

describe('dynamic slotting', () => {
    it('should render all slots', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual('Default slotNamed 1Overridden default content');
    });
    it('should handle slot name being set to undefined or an empty string', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const childElm = elm.shadowRoot.querySelector('x-child');
        const defaultSlot = childElm.shadowRoot.querySelector('slot:not([name])');
        const altSlot = childElm.shadowRoot.querySelector('slot[name="altdefault"]');

        expect(defaultSlot.assignedNodes().length).toBe(1);
        expect(altSlot.assignedNodes().length).toBe(0);

        elm.setFullSlotname();
        await Promise.resolve();
        expect(defaultSlot.assignedNodes().length).toBe(0);
        expect(altSlot.assignedNodes().length).toBe(1);

        elm.setEmptyName();
        await Promise.resolve();
        expect(defaultSlot.assignedNodes().length).toBe(1);
        expect(altSlot.assignedNodes().length).toBe(0);
    });
    it('should rerender slots', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual('Default slotNamed 1Overridden default content');

        elm.increment();
        await Promise.resolve();
        expect(elm.shadowRoot.textContent).toEqual('Default slotNamed 2Overridden default content'); // notice the 2 in the text
    });

    it('should render in light DOM', () => {
        const elm = createElement('x-light-parent', { is: LightParent });
        document.body.appendChild(elm);
        expect(elm.textContent).toEqual('Default slotNamed 1Hi lwc');
    });
});
