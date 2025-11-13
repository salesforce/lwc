import { createElement } from 'lwc';
import LWCParent from 'x/lwcParent';
import NativeSlottedBasic from './x/NativeBasic/NativeBasic';

function testAssignedNodes(testDescription, getContainer) {
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
        it('assignedNodes of default slot content', () => {
            const defaultSlot = nativeSlottedBasic.shadowRoot.querySelector('slot');
            const assignedNodes = defaultSlot.assignedNodes();
            expect(assignedNodes.length).toBe(2);
            expect(assignedNodes[0].getAttribute('data-slot-id')).toBe('default');
        });

        it('assignedNodes of named slot', () => {
            const namedSlot = nativeSlottedBasic.shadowRoot.querySelector("slot[name='slot1']");
            const assignedNodes = namedSlot.assignedNodes();
            expect(assignedNodes.length).toBe(1);
            expect(assignedNodes[0].getAttribute('data-slot-id')).toBe('slot1');
        });
    });
}

testAssignedNodes(
    'assignedNodes() retains native behavior in native shadow dom tree',
    () => document.body
);

testAssignedNodes(
    'assignedNodes() retains behavior in native shadow tree nested in lwc parent',
    () => {
        const lwcParent = createElement('x-lwc-parent', { is: LWCParent });
        document.body.appendChild(lwcParent);

        return lwcParent.shadowRoot.querySelector('div');
    }
);
