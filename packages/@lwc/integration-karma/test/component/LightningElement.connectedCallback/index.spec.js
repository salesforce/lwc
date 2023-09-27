import { createElement } from 'lwc';
import { customElementCallbackReactionErrorListener } from 'test-utils';

import Test from 'x/test';
import ConnectedCallbackThrow from 'x/connectedCallbackThrow';
import XSlottedParent from 'x/slottedParent';

function testConnectSlot(name, fn) {
    it(`should invoke the connectedCallback the root element is added in the DOM via ${name}`, () => {
        let isConnected = false;
        let thisValue;

        const elm = createElement('x-test', { is: Test });
        elm.connect = function (context) {
            isConnected = true;
            thisValue = context;
        };

        fn(elm);

        expect(thisValue instanceof Test).toBe(true);
        expect(isConnected).toBe(true);
    });
}

testConnectSlot('Node.appendChild', (elm) => {
    document.body.appendChild(elm);
});

testConnectSlot('Node.insertBefore', (elm) => {
    const child = document.createElement('div');
    document.body.appendChild(child);
    document.body.insertBefore(elm, child);
});

testConnectSlot('Node.replaceChild', (elm) => {
    const child = document.createElement('div');
    document.body.appendChild(child);
    document.body.replaceChild(elm, child);
});

it('should associate the component stack when the invocation throws', () => {
    const elm = createElement('x-connected-callback-throw', { is: ConnectedCallbackThrow });

    const error = customElementCallbackReactionErrorListener(() => {
        document.body.appendChild(elm);
    });

    expect(error).not.toBe(undefined);
    expect(error.message).toBe('throw in connected');
    expect(error.wcStack).toBe('<x-connected-callback-throw>');
});

describe('addEventListner in `connectedCallback`', () => {
    it('clicking force button should update value', function () {
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
