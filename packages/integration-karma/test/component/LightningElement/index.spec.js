import { LightningElement } from 'lwc';
import { createElement } from 'test-utils';

it('should throw when trying to invoke the constructor manually', () => {
    expect(() => {
        new LightningElement();
    }).toThrowError(ReferenceError);

    expect(() => {
        class Test extends LightningElement {}
        new Test();
    }).toThrowError(ReferenceError);
});

// TODO: #1034 "setAttribute" and "tagName" are enumerable attributes on the component instance
xit('should have no property enumerable on the component instance', () => {
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
