import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import LightContainer from './x/lightContainer/lightContainer';

describe('light DOM slot forwarding reactivity', () => {
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

    const verifySlotContent = (leaf, expected) => {
        const children = Array.from(leaf.shadowRoot ? leaf.shadowRoot.children : leaf.children);
        expect(children.length).toEqual(expected.length);

        children.forEach((child, i) => {
            const actualSlotContent =
                child.tagName.toLowerCase() === 'slot' ? child.assignedNodes()[0] : child;
            expect(child.getAttribute('slot')).toEqual(expected[i].slotAssignment);
            expect(actualSlotContent.innerText).toEqual(expected[i].slotContent);
        });
    };

    const expectedDefaultSlotContent = [
        {
            slotAssignment: 'upper',
            slotContent: 'Upper slot content',
        },
        {
            slotAssignment: 'lower',
            slotContent: 'Lower slot content',
        },
        {
            slotAssignment: 'default',
            slotContent: 'Default slot content',
        },
    ];

    const expectedSlotContentAfterParentMutation = [
        {
            slotAssignment: 'upper',
            slotContent: 'Lower slot content',
        },
        {
            slotAssignment: 'lower',
            slotContent: 'Upper slot content',
        },
        {
            slotAssignment: 'default',
            slotContent: 'Default slot content',
        },
    ];

    const expectedSlotContentAfterForwardedSlotMutation = [
        {
            slotAssignment: 'upper',
            slotContent: 'Upper slot content',
        },
        {
            slotAssignment: 'lower',
            slotContent: 'Default slot content',
        },
        {
            slotAssignment: 'default',
            slotContent: 'Lower slot content',
        },
    ];

    const expectedSlotContentAfterLeafMutation = [
        {
            slotAssignment: 'lower',
            slotContent: 'Upper slot content',
        },
        {
            slotAssignment: '',
            slotContent: 'Default slot content',
        },
        {
            slotAssignment: 'upper',
            slotContent: 'Lower slot content',
        },
    ];

    ['lightLight', 'lightShadow'].forEach((slotForwardingType) => {
        it(`should update correctly for ${slotForwardingType} slots`, async () => {
            const parent = nodes[slotForwardingType];
            const leaf = parent.leaf;
            expect((leaf.shadowRoot?.children ?? leaf.children).length).toBe(3);

            verifySlotContent(leaf, expectedDefaultSlotContent);

            lightContainer[`${slotForwardingType}Upper`] = 'lower';
            lightContainer[`${slotForwardingType}Lower`] = 'upper';

            await Promise.resolve();

            verifySlotContent(leaf, expectedSlotContentAfterParentMutation);

            parent.upperSlot = '';
            parent.lowerSlot = 'upper';
            parent.defaultSlot = 'lower';

            await Promise.resolve();

            verifySlotContent(leaf, expectedSlotContentAfterForwardedSlotMutation);

            leaf.upperSlot = 'lower';
            leaf.lowerSlot = '';
            leaf.defaultSlot = 'upper';

            await Promise.resolve();

            verifySlotContent(leaf, expectedSlotContentAfterLeafMutation);
        });
    });
});
