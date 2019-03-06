import { createElement } from 'test-utils';

import Slotted from 'x/slotted';
import Test from 'x/test';

function testDisconnectSlot(name, fn) {
    it(`should invoke the disconnectedCallback when root element is removed from the DOM via ${name}`, () => {
        let isDisconnected = false;
        let thisValue;

        const elm = createElement('x-test', { is: Test });
        elm.disconnect = function(context) {
            isDisconnected = true;
            thisValue = context;
        };

        fn(elm);

        expect(thisValue instanceof Test).toBe(true);
        expect(isDisconnected).toBe(true);
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

describe('disconnect host with slots', () => {
    let parentDisconnectSpy;
    let slotIgnoringChildSpy;
    let slotAcceptingChildSpy;
    let parent;
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
    it('should not throw when disconnecting host with unrendered slot content', () => {
        document.body.removeChild(parent);
        expect(parentDisconnectSpy).toHaveBeenCalledTimes(1);
        expect(slotAcceptingChildSpy).toHaveBeenCalledTimes(1);
        expect(slotIgnoringChildSpy).toHaveBeenCalledTimes(1);
    });

    /**
     * In this scenario the slot content from the parent's template is unrendered.
     * disconnecting the slot receiver was causing errors.
     **/

    it('when child element ignores slot content from parent is removed', () => {
        parent.hideChildIgnoresSlots = true;

        return Promise.resolve(() => {
            expect(parentDisconnectSpy).not.toHaveBeenCalled();
            expect(slotIgnoringChildSpy).toHaveBeenCalledTimes(1);
            expect(slotAcceptingChildSpy).not.toHaveBeenCalled();
        });
    });

    it('when child element accepting slot content from parent is removed', () => {
        parent.hideChildAcceptsSlots = true;
        return Promise.resolve(() => {
            expect(parentDisconnectSpy).not.toHaveBeenCalled();
            expect(slotAcceptingChildSpy).toHaveBeenCalledTimes(1);
            expect(slotIgnoringChildSpy).not.toHaveBeenCalled();
        });
    });
});
