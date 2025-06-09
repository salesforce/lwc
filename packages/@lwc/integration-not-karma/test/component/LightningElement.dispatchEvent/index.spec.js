import { createElement, LightningElement } from 'lwc';

import Test from 'x/test';

function testDispatchEvent(type, name, dispatchedEvent) {
    it(`should allow to dispatch ${type}`, () => {
        let receivedEvent;

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        elm.addEventListener(name, (event) => {
            receivedEvent = event;
        });
        elm.dispatch(dispatchedEvent);

        expect(dispatchedEvent).toBe(receivedEvent);
    });
}

testDispatchEvent('Event', 'test', new Event('test'));
testDispatchEvent('CustomEvent', 'testcustom', new CustomEvent('testcustom'));
testDispatchEvent('FocusEvent', 'testfocus', new CustomEvent('testfocus'));

it('should throw an error if the parameter is not an instance of Event', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(() => {
        elm.dispatch('event');
    }).toThrowError();
});

it('should not throw when event is dispatched during construction', function () {
    class Test extends LightningElement {
        constructor() {
            super();
            this.dispatchEvent(new CustomEvent('event'));
        }
    }
    expect(() => {
        createElement('x-test', { is: Test });
    }).not.toThrow();
});
