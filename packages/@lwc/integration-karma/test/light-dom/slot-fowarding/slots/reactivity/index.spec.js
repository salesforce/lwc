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
        // expect(children.length).toEqual(expected.length);

        children.forEach((child, i) => {
            const actualSlotContent =
                child.tagName.toLowerCase() === 'slot' ? child.assignedNodes() : [child];
            actualSlotContent.forEach((slotContent, k) => {
                // i+k is just for the conditional test
                expect(child.getAttribute('slot')).toEqual(expected[i + k].slotAssignment);
                expect(slotContent.innerText).toEqual(expected[i + k].slotContent);
            });
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
            slotAssignment: process.env.API_VERSION > 60 ? 'default' : null,
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
            slotAssignment: process.env.API_VERSION > 60 ? 'default' : null,
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

    const expectedSlotContentAfterConditionalMutation =
        process.env.API_VERSION > 60
            ? [
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
                  {
                      slotAssignment: 'upper',
                      slotContent: 'Conditional slot content',
                  },
              ]
            : [
                  expectedSlotContentAfterParentMutation[0],
                  {
                      slotAssignment: 'upper',
                      slotContent: 'Conditional slot content',
                  },
                  ...expectedSlotContentAfterParentMutation.slice(1),
              ];

    let testCases = ['lightLight', 'lightShadow'];

    if (process.env.NATIVE_SHADOW) {
        // TODO [#3885]: Using expressions on synthetic shadow DOM slots throws an error, only test in native for now
        testCases.push('shadowLight');
    }

    if (process.env.API_VERSION < 61) {
        // Note for api versions < 61 light DOM slot forwarding is disabled.
        // Testing with just lightLight should be sufficient as a regression test.
        testCases = testCases.filter((test) => test === 'lightLight');
    }

    testCases.forEach((slotForwardingType) => {
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

            verifySlotContent(
                leaf,
                process.env.API_VERSION > 60
                    ? expectedSlotContentAfterForwardedSlotMutation
                    : expectedSlotContentAfterParentMutation
            );

            leaf.upperSlot = 'lower';
            leaf.lowerSlot = '';
            leaf.defaultSlot = 'upper';

            await Promise.resolve();

            verifySlotContent(
                leaf,
                process.env.API_VERSION > 60
                    ? expectedSlotContentAfterLeafMutation
                    : expectedSlotContentAfterParentMutation
            );

            lightContainer[`${slotForwardingType}ConditionalSlot`] = true;

            await Promise.resolve();

            verifySlotContent(leaf, expectedSlotContentAfterConditionalMutation);
        });
    });
});
