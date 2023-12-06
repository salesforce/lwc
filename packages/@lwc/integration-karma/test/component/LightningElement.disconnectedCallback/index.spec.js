import { createElement } from 'lwc';
import { customElementCallbackReactionErrorListener } from 'test-utils';

import Slotted from 'x/slotted';
import Test from 'x/test';
import DisconnectedCallbackThrow from 'x/disconnectedCallbackThrow';
import DualTemplate from 'x/dualTemplate';
import ExplicitRender from 'x/explicitRender';

function testDisconnectSlot(name, fn) {
    it(`should invoke the disconnectedCallback when root element is removed from the DOM via ${name}`, () => {
        return new Promise((resolve) => {
            const elm = createElement('x-test', { is: Test });
            elm.disconnect = function (context) {
                expect(context instanceof Test).toBe(true);
                resolve();
            };

            fn(elm);
        });
    });
}

describe('disconnectedCallback should be invoked for Node APIs', () => {
    testDisconnectSlot('Node.removeChild', (elm) => {
        document.body.appendChild(elm);
        document.body.removeChild(elm);
    });

    testDisconnectSlot('Node.replaceChild', (elm) => {
        const newChild = document.createElement('div');
        document.body.appendChild(elm);
        document.body.replaceChild(newChild, elm);
    });

    testDisconnectSlot('Node.appendChild', (elm) => {
        const sibling = document.createElement('div');
        document.body.appendChild(elm);
        document.body.appendChild(sibling);
        // Disconnect and reattach element to another part of tree
        sibling.appendChild(elm);
    });

    testDisconnectSlot('Node.insertBefore', (elm) => {
        const container = document.createElement('div');
        document.body.appendChild(elm);
        document.body.appendChild(container);
        container.innerHTML = '<ul><li class="first">First</li><li class="second">Second</li></ul>';
        // Disconnect and reattach element to another part of tree
        const ul = container.querySelector('ul');
        const secondLi = container.querySelector('second');
        ul.insertBefore(elm, secondLi);
    });
});

xdescribe('#1102 - disconnectedCallback should be invoked for ChildNode APIs', () => {
    testDisconnectSlot('ChildNode.remove', (elm) => {
        document.body.appendChild(elm);
        elm.remove();
    });

    testDisconnectSlot('ChildNode.replaceWith', (elm) => {
        const newChild = document.createElement('div');
        document.body.appendChild(elm);
        elm.replaceWith(newChild);
    });

    testDisconnectSlot('ChildNode.after', (elm) => {
        const container = document.createElement('div');
        document.body.appendChild(elm);
        document.body.appendChild(container);
        container.innerHTML = '<p></p>';
        const p = container.querySelector('p');
        // Disconnect and reattach element to another part of tree
        p.after(elm);
    });

    testDisconnectSlot('ChildNode.before', (elm) => {
        const container = document.createElement('div');
        document.body.appendChild(elm);
        document.body.appendChild(container);
        container.innerHTML = '<p></p>';
        const p = container.querySelector('p');
        // Disconnect and reattach element to another part of tree
        p.before(elm);
    });
});

describe('disconnectedCallback for host with slots', () => {
    let parentDisconnectSpy;
    let slotIgnoringChildSpy;
    let slotAcceptingChildSpy;
    let parent;

    beforeAll(() => {
        // Ignore the engine logging about passing slot content to a component that does not accept slot
        // These should become unnecessary when #869 is fixed
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

it('should associate the component stack when the invocation throws', () => {
    const elm = createElement('x-disconnected-callback-throw', { is: DisconnectedCallbackThrow });
    document.body.appendChild(elm);

    const error = customElementCallbackReactionErrorListener(() => {
        document.body.removeChild(elm);
    });

    expect(error).not.toBe(undefined);
    expect(error.message).toBe('throw in disconnected');
    expect(error.wcStack).toBe('<x-disconnected-callback-throw>');
});

describe('disconnectedCallback for components with a explicit render()', () => {
    let disconnectedCallbackInvoked;
    function disconnectedCallback() {
        disconnectedCallbackInvoked = true;
    }
    beforeEach(() => {
        disconnectedCallbackInvoked = false;
    });
    it('should invoke disconnectedCallback for children when parent is removed', () => {
        const parent = createElement('x-explicitrender', { is: ExplicitRender });
        document.body.appendChild(parent);
        const child = parent.shadowRoot.querySelector('x-test');
        child.disconnect = disconnectedCallback;

        document.body.removeChild(parent);
        expect(disconnectedCallbackInvoked).toBe(true);
    });

    it('should invoke disconnectedCallback for children when parent switches template', () => {
        const parent = createElement('x-parent', { is: DualTemplate });
        document.body.appendChild(parent);
        const child = parent.shadowRoot.querySelector('x-test');
        child.disconnect = disconnectedCallback;
        parent.hideChild = true;
        return Promise.resolve().then(() => {
            expect(disconnectedCallbackInvoked).toBe(true);
        });
    });
});
