import { createElement } from 'test-utils';

import Test from 'x/test';
import ConstructorInvocation from 'x/constructorInvocation';

it('should throw when accessing during construction', () => {
    expect(() => {
        createElement('x-constructor-invocation', { is: ConstructorInvocation });
    }).toThrowError(
        Error,
        /Assert Violation: this\.getBoundingClientRect\(\) should not be called during the construction of the custom element for <x-constructor-invocation> because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks\./
    );
});

it('should return the host element dimensions', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('style', 'display: block; overflow: hidden; width: 10px; height: 10px');
    document.body.appendChild(elm);

    const result = elm.getComponentBoundingClientRect();
    expect(result.width).toBe(10);
    expect(result.height).toBe(10);
});
