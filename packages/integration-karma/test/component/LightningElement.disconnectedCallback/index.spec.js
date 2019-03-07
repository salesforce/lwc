import { createElement } from 'test-utils';

import Slotted from 'x/slotted';
import Test from 'x/test';

function testDisconnectSlot(name, fn) {
    it(`should invoke the disconnectedCallback when root element is removed from the DOM via ${name}`, done => {
        const elm = createElement('x-test', { is: Test });
        elm.disconnect = function(context) {
            expect(context instanceof Test).toBe(true);
            done();
        };

        fn(elm);
    });
}

testDisconnectSlot('Node.removeChild', elm => {
    document.body.appendChild(elm);
    document.body.removeChild(elm);
});

testDisconnectSlot('Node.replaceChild', elm => {
    const newChild = document.createElement('div');
    document.body.appendChild(elm);
    document.body.replaceChild(newChild, elm);
});

describe('disconnectedCallback for host with slots', () => {
    let parentDisconnectSpy;
    let slotIgnoringChildSpy;
    let slotAcceptingChildSpy;
    let parent;

    beforeAll(() => {
        // Ignore the engine logging about passing slot content to a component that does not accept slot
        spyOn(console, 'group');
        spyOn(console, 'log');
        spyOn(console, 'groupEnd');
    });

    beforeEach(() => {
        parentDisconnectSpy = jasmine.createSpy();
        slotIgnoringChildSpy = jasmine.createSpy();
        slotAcceptingChildSpy = jasmine.createSpy();
        parent = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(parent);
        parent.disconnect = parentDisconnectSpy;
        parent.shadowRoot.querySelector('x-accepting-slots').disconnect = slotAcceptingChildSpy;
        parent.shadowRoot.querySelector('x-ignoring-slots').disconnect = slotIgnoringChildSpy;
    });

    it('should invoke disconnectedCallback on host and all children components', () => {
        document.body.removeChild(parent);
        expect(parentDisconnectSpy).toHaveBeenCalledTimes(1);
        expect(slotAcceptingChildSpy).toHaveBeenCalledTimes(1);
        expect(slotIgnoringChildSpy).toHaveBeenCalledTimes(1);
    });

    /**
     * Automation for issue #1090
     * In this scenario the slot content from the parent's template is unrendered.
     * disconnecting the slot receiver was causing errors
     **/
    it('should invoke disconnectedCallback on child that has unrendered slot content', () => {
        parent.hideChildIgnoresSlots = true;

        return Promise.resolve(() => {
            expect(parentDisconnectSpy).not.toHaveBeenCalled();
            expect(slotIgnoringChildSpy).toHaveBeenCalledTimes(1);
            expect(slotAcceptingChildSpy).not.toHaveBeenCalled();
        });
    });

    it('should invoke disconnectedCallback on child that has rendered slot content', () => {
        const slotContent = parent.shadowRoot.querySelector('x-test.slotted');
        const slotContentDisconnectSpy = jasmine.createSpy();
        slotContent.disconnect = slotContentDisconnectSpy;
        parent.hideChildAcceptsSlots = true;
        return Promise.resolve(() => {
            expect(parentDisconnectSpy).not.toHaveBeenCalled();
            expect(slotAcceptingChildSpy).toHaveBeenCalledTimes(1);
            expect(slotContentDisconnectSpy).toHaveBeenCalledTimes(1);
            expect(slotIgnoringChildSpy).not.toHaveBeenCalled();
        });
    });
});
