import { createElement } from 'test-utils';

import Test from 'x/test';

const TEST_NS = 'http://www.salesforce.com/2019/lwc';

it('throws an error if namespace is not provided', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.removeComponentAttributeNS();
    }).toThrowError(TypeError);
});

it('throws an error if name is not provided', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.removeComponentAttributeNS(TEST_NS);
    }).toThrowError(TypeError);
});

it('should not throw if the attribute is not present', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.removeComponentAttributeNS(TEST_NS, 'foo');
    }).not.toThrowError();
});

it('should return undefined', () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.removeComponentAttributeNS(TEST_NS, 'foo')).toBe(undefined);
});

it('should remove the attribute if present on the host element', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttributeNS(TEST_NS, 'foo', 'bar');
    elm.removeComponentAttributeNS(TEST_NS, 'foo');

    expect(elm.hasAttributeNS(TEST_NS, 'foo')).toBe(false);
});
