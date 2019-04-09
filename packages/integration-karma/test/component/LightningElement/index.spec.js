import { LightningElement } from 'lwc';
import { createElement } from 'test-utils';

import NotInvokingSuper from 'x/notInvokingSuper';
import NotReturningThis from 'x/notReturningThis';

it('should throw when trying to invoke the constructor manually', () => {
    expect(() => {
        new LightningElement();
    }).toThrowError(ReferenceError);

    expect(() => {
        class Test extends LightningElement {}
        new Test();
    }).toThrowError(ReferenceError);
});

it('should have no property enumerable on the component instance', () => {
    let enumerableProperties = [];

    class Test extends LightningElement {
        connectedCallback() {
            enumerableProperties = Object.keys(this);
        }
    }

    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(enumerableProperties).toEqual([]);
});

it("should fail when the constructor doesn't invoke super()", () => {
    expect(() => {
        createElement('x-not-invoking-super', { is: NotInvokingSuper });
    }).toThrowError(ReferenceError);
});

it('should fail when the constructor return an instance of LightningElement', () => {
    expect(() => {
        createElement('x-not-returning-this', { is: NotReturningThis });
    }).toThrowError(
        TypeError,
        'Invalid component constructor, the class should extend LightningElement.'
    );
});
