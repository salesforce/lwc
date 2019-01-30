import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

it('should throw when accessing during construction', () => {
    class Test extends LightningElement {
        constructor() {
            super();
            this.getBoundingClientRect();
        }
    }

    expect(() => {
        createElement('x-test', { is: Test });
    }).toThrowError(
        Error,
        /Assert Violation: this\.getBoundingClientRect\(\) should not be called during the construction of the custom element for <x-test> because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks\./
    );
});

it('should return the host element dimensions', () => {
    class Test extends LightningElement {
        @api
        getComponentBoundingClientRect() {
            return this.getBoundingClientRect();
        }
    }

    const elm = createElement('x-test', { is: Test });
    elm.style = 'display: block; width: 10px; height: 10px';
    document.body.appendChild(elm);

    const result = elm.getComponentBoundingClientRect();
    expect(result.width).toBe(10);
    expect(result.height).toBe(10);
});
