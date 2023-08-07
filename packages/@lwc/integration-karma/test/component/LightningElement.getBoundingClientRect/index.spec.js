import { createElement } from 'lwc';

import Test from 'x/test';
import ConstructorInvocation from 'x/constructorInvocation';

// IE11 doesn't support calling Element.getBoundingClientRect if the element is not attached to the DOM. We need to
// disable the test specifically on IE11 because it would fail when running in prod compat mode.
// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/106812/
const supportCallingGetBoundingClientRect = (() => {
    const elm = document.createElement('div');

    try {
        elm.getBoundingClientRect();
        return true;
    } catch (error) {
        return false;
    }
})();

if (supportCallingGetBoundingClientRect) {
    it('should throw when accessing during construction', () => {
        expect(() => {
            createElement('x-constructor-invocation', { is: ConstructorInvocation });
        }).toLogErrorDev(
            /Error: \[LWC error]: this\.getBoundingClientRect\(\) should not be called during the construction of the custom element for <x-constructor-invocation> because the element is not yet in the DOM or has no children yet\./
        );
    });
}

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
