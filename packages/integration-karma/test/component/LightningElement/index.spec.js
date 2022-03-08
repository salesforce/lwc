import { LightningElement } from 'lwc';
import { createElement } from 'lwc';

import NotInvokingSuper from 'x/notInvokingSuper';
import NotReturningThis from 'x/notReturningThis';
import ParentThrowingBeforeSuper from 'x/parentThrowingBeforeSuper';

it('should throw when trying to invoke the constructor manually', () => {
    expect(() => {
        new LightningElement();
    }).toThrowError(/Illegal constructor/);

    expect(() => {
        class Test extends LightningElement {}
        new Test();
    }).toThrowError(/Illegal constructor/);
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

it("[W-6981076] shouldn't throw when a component with an invalid child in unmounted", () => {
    const elm = createElement('x-parent-throwing-before-super', { is: ParentThrowingBeforeSuper });

    expect(() => document.body.appendChild(elm)).toThrowError(/Throwing before calling super/);
    expect(() => document.body.removeChild(elm)).not.toThrow();
});
