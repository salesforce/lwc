import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import LightContainer from './x/lightContainer/lightContainer';

const vFragBookend = process.env.API_VERSION > 59 ? document.createComment('') : '';
const commentNode = document.createComment(' comments being forwarded ');

describe('slot forwarding', () => {
    let nodes;
    let lightContainer;
    beforeAll(() => {
        lightContainer = createElement('x-light-container', { is: LightContainer });
        document.body.appendChild(lightContainer);
        nodes = extractDataIds(lightContainer);
    });

    afterAll(() => {
        document.body.removeChild(lightContainer);
    });

    it('should correctly forward slot assignments - light > light slot', () => {
        const lightLightLeaf = nodes['light-light-leaf'];
        // Note these include the vFragmentBookend elements
        expect(lightLightLeaf.childNodes.length).toBe(15);

        const slotContent = Array.from(lightLightLeaf.childNodes);
        const upperSlotContent = slotContent.slice(0, 4);
        // Lower content is now mapped to upper slot
        expect(upperSlotContent[0]).toEqual(vFragBookend);
        expect(upperSlotContent[1].tagName.toLowerCase()).toBe('x-shadow-dom-element');
        expect(upperSlotContent[2].innerText).toEqual('Lower slot forwarded content');
        expect(upperSlotContent[3]).toEqual(vFragBookend);

        // Upper content is now mapped to lower slot
        const lowerSlotContent = slotContent.slice(4, 8);
        expect(lowerSlotContent[0]).toEqual(vFragBookend);
        expect(lowerSlotContent[1].tagName.toLowerCase()).toEqual('x-light-dom-element');
        expect(lowerSlotContent[2].innerText).toEqual('Upper slot forwarded content');
        expect(lowerSlotContent[3]).toEqual(vFragBookend);

        // Default slot content is mapped to `defaultSlotReassigned` slot
        const remappedDefaultSlotContent = slotContent.slice(8, 11);
        expect(remappedDefaultSlotContent[0]).toEqual(vFragBookend);
        expect(remappedDefaultSlotContent[1].innerText).toEqual(
            'Static vnode default slot forwarded'
        );
        expect(remappedDefaultSlotContent[2]).toEqual(vFragBookend);

        // Text and comments always mapped to the default slot
        const defaultSlotContent = slotContent.slice(11, 15);
        expect(defaultSlotContent[0]).toEqual(vFragBookend);
        expect(defaultSlotContent[1].textContent).toEqual('Text being forwarded');
        expect(defaultSlotContent[2]).toEqual(commentNode);
        expect(defaultSlotContent[3]).toEqual(vFragBookend);
    });

    it('should correctly forward slot assignments - light > shadow slot', () => {
        const lightShadowLeaf = nodes['light-shadow-leaf'];
        expect(lightShadowLeaf.shadowRoot.children.length).toBe(4);

        const slots = extractDataIds(lightShadowLeaf);
        const upperSlotContent = slots['upper-slot'].assignedNodes();
        expect(upperSlotContent[0].getAttribute('slot')).toBe('upper');
        expect(upperSlotContent[0].tagName.toLowerCase()).toBe('x-shadow-dom-element');
        expect(upperSlotContent[1].getAttribute('slot')).toBe('upper');
        expect(upperSlotContent[1].innerText).toEqual('Lower slot forwarded content');

        const lowerSlotContent = slots['lower-slot'].assignedNodes();
        expect(lowerSlotContent[0].getAttribute('slot')).toBe('lower');
        expect(lowerSlotContent[0].tagName.toLowerCase()).toEqual('x-light-dom-element');
        expect(lowerSlotContent[1].getAttribute('slot')).toBe('lower');
        expect(lowerSlotContent[1].innerText).toEqual('Upper slot forwarded content');

        const reassginedDefaultSlot = slots['default-slot-reassigned'].assignedNodes();
        // Verify static vnode `slot` attribute is reassigned
        expect(reassginedDefaultSlot[0].getAttribute('slot')).toBe('defaultSlotReassigned');
        expect(reassginedDefaultSlot[0].innerText).toEqual('Static vnode default slot forwarded');

        const defaultSlotContent = slots['default-slot'].assignedNodes();
        expect(defaultSlotContent[0].textContent).toEqual('Text being forwarded');
        if (!process.env.NATIVE_SHADOW) {
            // Native shadow doesn't slot comments
            expect(defaultSlotContent[1]).toEqual(commentNode);
        }
    });

    it('should correctly forward slot assignments - shadow > light slot', () => {
        const shadowLightLeaf = nodes['shadow-light-leaf'];
        expect(shadowLightLeaf.children.length).toBe(3);

        const slots = extractDataIds(shadowLightLeaf);

        const upperSlot = slots['upper-slot'];
        // In this test, the shadow slot is passed directly to the light DOM slot which will cause the
        // slot attribute to be remapped to the slot attribute on the light DOM slot.
        // Verify the slot attribute was correctly updated.
        expect(upperSlot.hasAttribute('slot')).toBe(false);

        const upperSlotContent = upperSlot.assignedNodes();
        // Note that because the shadow slot is passed, the slot element is what's updated.
        // Verify that the children have not been modified.
        expect(upperSlotContent[0].getAttribute('slot')).toBe('lower');
        expect(upperSlotContent[0].tagName.toLowerCase()).toBe('x-shadow-dom-element');
        expect(upperSlotContent[1].getAttribute('slot')).toBe('lower');
        expect(upperSlotContent[1].innerText).toEqual('Lower slot forwarded content');

        const lowerSlot = slots['lower-slot'];
        expect(lowerSlot.hasAttribute('slot')).toBe(false);

        const lowerSlotContent = lowerSlot.assignedNodes();
        expect(lowerSlotContent[0].getAttribute('slot')).toBe('upper');
        expect(lowerSlotContent[0].tagName.toLowerCase()).toEqual('x-light-dom-element');
        expect(lowerSlotContent[1].getAttribute('slot')).toBe('upper');
        expect(lowerSlotContent[1].innerText).toEqual('Upper slot forwarded content');

        const defaultSlot = slots['default-slot'];
        expect(defaultSlot.hasAttribute('slot')).toBe(false);

        // Note since the content forwarded to the default shadow slot are wrapped in an actual slot element,
        // all content inside of it is forwarded together.
        // This is in contrast to the above test where the static element is re-parented to reassginedDefaultSlot
        const defaultSlotContent = defaultSlot.assignedNodes();
        expect(defaultSlotContent[0].textContent).toEqual('Text being forwarded');
        if (!process.env.NATIVE_SHADOW) {
            // Native shadow doesn't slot comments
            expect(defaultSlotContent[1]).toEqual(commentNode);
        }
        expect(defaultSlotContent[process.env.NATIVE_SHADOW ? 1 : 2].innerText).toEqual(
            'Static vnode default slot forwarded'
        );
    });
});
