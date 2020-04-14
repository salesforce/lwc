import { createElement } from 'lwc';
import LWCParent from 'x/lwcParent';
import NativeSlottedBasic from './x/NativeBasic/NativeBasic';

function testAssignedElements(testDescription, container) {
    describe(testDescription, () => {
        let nativeSlottedBasic;
        beforeEach((done) => {
            nativeSlottedBasic = NativeSlottedBasic();
            container.appendChild(nativeSlottedBasic);
            // Allow for portal elements to be adopted
            return Promise.resolve().then(() => {
                done();
            });
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

// Chrome is the only browser implementing HTMLSlotElement.assignedElement natively.
// Webkit - https://bugs.webkit.org/show_bug.cgi?id=180908
// Gecko - https://bugzilla.mozilla.org/show_bug.cgi?id=1425685
const SUPPORT_ASSIGNED_ELEMENTS =
    !process.env.NATIVE_SHADOW || 'assignedElements' in document.createElement('slot');

// Should not be expecting native shadow behavior to work in compat mode
if (SUPPORT_ASSIGNED_ELEMENTS && process.env.COMPAT !== true) {
    testAssignedElements(
        'assignedElements() retains native behavior in native shadow dom tree',
        document.body
    );
    const lwcParent = createElement('x-lwc-parent', { is: LWCParent });
    document.body.appendChild(lwcParent);
    const domManual = lwcParent.shadowRoot.querySelector('div');
    testAssignedElements(
        'assignedElements() retains behavior in native shadow tree nested in lwc parent',
        domManual
    );
}
