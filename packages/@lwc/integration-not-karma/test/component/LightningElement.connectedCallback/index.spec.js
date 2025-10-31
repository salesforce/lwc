import { createElement } from 'lwc';

import Test from 'c/test';
import ConnectedCallbackThrow from 'c/connectedCallbackThrow';
import XSlottedParent from 'c/slottedParent';
import { customElementCallbackReactionErrorListener } from '../../../helpers/matchers/errors.js';

function testConnectSlot(name, fn) {
    it(`should invoke the connectedCallback the root element is added in the DOM via ${name}`, () => {
        let isConnected = false;
        let thisValue;

        const elm = createElement('c-test', { is: Test });
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
    const elm = createElement('c-connected-callback-throw', { is: ConnectedCallbackThrow });

    const error = customElementCallbackReactionErrorListener(() => {
        document.body.appendChild(elm);
    });

    expect(error).not.toBe(undefined);
    expect(error.message).toBe('throw in connected');
    expect(error.wcStack).toBe('<c-connected-callback-throw>');
});

describe('addEventListner in `connectedCallback`', () => {
    it('clicking force button should update value', async () => {
        const elm = createElement('c-slotted-parent', { is: XSlottedParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('c-child');
        child.dispatchEventOnHost();
        await Promise.resolve();
        expect(elm.eventHandled).toBe(true);
        expect(elm.shadowRoot.querySelector('p').textContent).toBe('Was clicked: true');
    });
});
