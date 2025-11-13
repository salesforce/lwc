import { createElement } from 'lwc';

import Test from 'x/test';
import ConstructorInvocation from 'x/constructorInvocation';

it('should throw when accessing during construction', () => {
    expect(() => {
        createElement('x-constructor-invocation', { is: ConstructorInvocation });
    }).toLogErrorDev(
        /Error: \[LWC error]: this\.getBoundingClientRect\(\) should not be called during the construction of the custom element for <x-constructor-invocation> because the element is not yet in the DOM or has no children yet\./
    );
});

it('should return the host element dimensions', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('style', 'display: block; overflow: hidden; width: 10px; height: 10px');
    document.body.appendChild(elm);

    const result = elm.getComponentBoundingClientRect();
    // elm.getComponentBoundingClientRect returns a DOMRect
    // Using toBeCloseTo matcher to compare a double value.
    expect(result.width).toBeCloseTo(10, 3);
    expect(result.height).toBeCloseTo(10, 3);
});
