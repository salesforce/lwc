import { createElement } from 'lwc';
import LWCParent from 'x/lwcParent';
import NativeSlottedBasic from './x/NativeBasic/NativeBasic';

function testAssignedElements(testDescription, getContainer) {
    let container;

    beforeEach(() => {
        container = getContainer();
    });

    describe(testDescription, () => {
        let nativeSlottedBasic;
        beforeEach(() => {
            nativeSlottedBasic = NativeSlottedBasic();
            container.appendChild(nativeSlottedBasic);
            // Allow for portal elements to be adopted
            return Promise.resolve();
        });
        it('assignedElements of default slot content', () => {
            const defaultSlot = nativeSlottedBasic.shadowRoot.querySelector('slot');
            const assignedElements = defaultSlot.assignedElements();
            expect(assignedElements.length).toBe(1);
            expect(assignedElements[0].getAttribute('data-slot-id')).toBe('default');
        });

        it('assignedElements of named slot', () => {
            const namedSlot = nativeSlottedBasic.shadowRoot.querySelector("slot[name='slot1']");
            const assignedElements = namedSlot.assignedElements();
            expect(assignedElements.length).toBe(1);
            expect(assignedElements[0].getAttribute('data-slot-id')).toBe('slot1');
        });
    });
}

testAssignedElements(
    'assignedElements() retains native behavior in native shadow dom tree',
    () => document.body
);

testAssignedElements(
    'assignedElements() retains behavior in native shadow tree nested in lwc parent',
    () => {
        const lwcParent = createElement('x-lwc-parent', { is: LWCParent });
        document.body.appendChild(lwcParent);

        return lwcParent.shadowRoot.querySelector('div');
    }
);
