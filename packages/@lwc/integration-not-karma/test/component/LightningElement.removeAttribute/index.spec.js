import { createElement } from 'lwc';

import Test from 'x/test';

it('should not throw if the attribute is not present', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.removeComponentAttribute('foo');
    }).not.toThrowError();
});

it('should return undefined', () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.removeComponentAttribute('foo')).toBeUndefined();
});

it('should remove the attribute if present on the host element', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');
    elm.removeComponentAttribute('foo');

    expect(elm.hasAttribute('foo')).toBeFalse();
});

it('should lowercase the attribute name', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');
    elm.removeComponentAttribute('FOO');

    expect(elm.hasAttribute('foo')).toBeFalse();
});
