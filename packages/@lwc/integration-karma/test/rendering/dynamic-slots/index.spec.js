import { createElement } from 'lwc';
import Parent from 'x/parent';

describe('dynamic slotting', () => {
    it('should render all slots', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual('Default slotNamed 1Overridden default content');
    });
    it('should handle slot name being set to undefined', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        elm.toggleUndefinedName();
        await Promise.resolve();
        expect(elm.shadowRoot.textContent).toEqual('Named 1Overridden default contentDefault slot');
    });
    it('should rerender slots', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual('Default slotNamed 1Overridden default content');

        elm.increment();
        await Promise.resolve();
        expect(elm.shadowRoot.textContent).toEqual('Default slotNamed 2Overridden default content');
    });
});
