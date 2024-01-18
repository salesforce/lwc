import { createElement } from 'lwc';

import LightContainer from './x/lightContainer/lightContainer';

describe('scoped slots, slot forwarding', () => {
    let lightContainer;
    beforeAll(() => {
        lightContainer = createElement('x-light-container', { is: LightContainer });
        document.body.appendChild(lightContainer);
    });

    afterAll(() => {
        document.body.removeChild(lightContainer);
    });

    // TODO [#3889]: This test should be updated once a fix is ready.
    it('does not reassign slot content', () => {
        const leaf = lightContainer.querySelector('x-leaf');
        expect(leaf.shadowRoot.children.length).toEqual(2);

        const defaultSlot = leaf.shadowRoot.querySelector('slot');
        const defaultSlotContent = defaultSlot.assignedNodes();
        expect(defaultSlotContent.length).toEqual(1);
        expect(defaultSlotContent[0].innerText).toEqual('Hello world!');

        const fooSlot = leaf.shadowRoot.querySelector('[name="foo"]');
        const fooSlotContent = fooSlot.assignedNodes();
        // Note the slot reassignment does not work on scoped slots
        expect(fooSlotContent.length).toEqual(0);
    });
});
