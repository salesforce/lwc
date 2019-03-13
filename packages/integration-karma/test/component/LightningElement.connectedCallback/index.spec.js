import { createElement } from 'test-utils';

import Test from 'x/test';
import ConnectedCallbackThrow from 'x/connectedCallbackThrow';

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

it('should associated the component stack when the invocation throws', () => {
    const elm = createElement('x-connected-callback-throw', { is: ConnectedCallbackThrow });

    let error;
    try {
        document.body.appendChild(elm);
    } catch (e) {
        error = e;
    }

    expect(error).not.toBe(undefined);
    expect(error.message).toBe('throw in connected');
    expect(error.wcStack).toBe('<x-connected-callback-throw>');
});
