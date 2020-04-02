import { createElement } from 'lwc';

import Test from 'x/test';
import ParentWithThrowingChild from 'x/parentWithThrowingChild';
import XSlottedParent from 'x/slottedParent';
import XParent from 'x/parent';

function testConnectSlot(name, fn) {
    it(`should invoke the connectedCallback the root element is added in the DOM via ${name}`, () => {
        let isConnected = false;
        let thisValue;

        const elm = createElement('x-test', { is: Test });
        elm.connect = function(context) {
            isConnected = true;
            thisValue = context;
        };

        fn(elm);

        expect(thisValue instanceof Test).toBe(true);
        expect(isConnected).toBe(true);
    });
}

testConnectSlot('Node.appendChild', elm => {
    document.body.appendChild(elm);
});

testConnectSlot('Node.insertBefore', elm => {
    const child = document.createElement('div');
    document.body.appendChild(child);
    document.body.insertBefore(elm, child);
});

testConnectSlot('Node.replaceChild', elm => {
    const child = document.createElement('div');
    document.body.appendChild(child);
    document.body.replaceChild(elm, child);
});

it('should associate the component stack when the invocation throws', () => {
    const elm = createElement('x-parent-with-throwing-child', { is: ParentWithThrowingChild });

    document.body.appendChild(elm);

    expect(elm.error).not.toBe(undefined);
    expect(elm.error.message).toBe('throw in connected');
    expect(elm.error.wcStack).toMatch(/<x-connected-callback-throw>/);
});

describe('addEventListner in `connectedCallback`', () => {
    it('clicking force button should update value', function() {
        const elm = createElement('x-slotted-parent', { is: XSlottedParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        child.dispatchEventOnHost();
        return Promise.resolve().then(() => {
            expect(elm.eventHandled).toBe(true);
            expect(elm.shadowRoot.querySelector('p').textContent).toBe('Was clicked: true');
        });
    });
});

describe('connectedCallback for host with slots', () => {
    let parentConnectSpy;
    let slotAcceptingChildSpy;
    let acceptedSlotContentSpy;
    let parent;
    let container;

    beforeEach(() => {
        parentConnectSpy = jasmine.createSpy();
        slotAcceptingChildSpy = jasmine.createSpy();
        acceptedSlotContentSpy = jasmine.createSpy();
        parent = createElement('x-parent', { is: XParent });
        parent.connect = parentConnectSpy;

        document.body.appendChild(parent);
        parentConnectSpy.calls.reset();

        parent.shadowRoot.querySelector('x-accepting-slots').connect = slotAcceptingChildSpy;
        parent.shadowRoot.querySelector('x-test').connect = acceptedSlotContentSpy;
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    it('should invoke connectedCallback on appendChild', () => {
        container.appendChild(parent);
        expect(parentConnectSpy).toHaveBeenCalledTimes(1);
        expect(slotAcceptingChildSpy).toHaveBeenCalledTimes(1);
        expect(acceptedSlotContentSpy).toHaveBeenCalledTimes(1);
    });

    it('should invoke connectedCallback on insertBefore', () => {
        container.insertBefore(parent, null);
        expect(parentConnectSpy).toHaveBeenCalledTimes(1);
        expect(slotAcceptingChildSpy).toHaveBeenCalledTimes(1);
        expect(acceptedSlotContentSpy).toHaveBeenCalledTimes(1);
    });
});
