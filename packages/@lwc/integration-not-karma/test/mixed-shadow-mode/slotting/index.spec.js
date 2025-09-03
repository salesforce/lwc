import { createElement } from 'lwc';

import Parent from 'x/parent';

describe.runIf(process.env.NATIVE_SHADOW)('when slotting into a native mode component', () => {
    it('should render default slot content to the dom', () => {
        const parent = createElement('x-parent', { is: Parent });
        document.body.appendChild(parent);

        const childElm = parent.shadowRoot.querySelector('x-child');
        expect(childElm.shadowRoot.querySelector('.default-slot')).not.toBeNull();
    });
});
