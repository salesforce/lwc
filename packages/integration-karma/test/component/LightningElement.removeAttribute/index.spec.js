import { createElement } from 'test-utils';

import Test from 'x/test';

it('throws an error if name is not provided', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.removeComponentAttribute();
    }).toThrowError(TypeError);
});

it('should not throw if the attribute is not present', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.removeComponentAttribute('foo');
    }).not.toThrowError();
});

it('should return undefined', () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.removeComponentAttribute('foo')).toBe(undefined);
});

it('should remove the attribute if present on the host element', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');
    elm.removeComponentAttribute('foo');

    expect(elm.hasAttribute('foo')).toBe(false);
});

it('should lowercase the attribute name', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');
    elm.removeComponentAttribute('FOO');

    expect(elm.hasAttribute('foo')).toBe(false);
});
