import { createElement } from 'test-utils';

import Test from 'x/test';

const TEST_NS = 'http://www.salesforce.com/2019/lwc';

function testInvalidProperty(type, ns, name) {
    it(`should return null when passing an invalid attribute name ${type}`, () => {
        const elm = createElement('x-test', { is: Test });
        expect(elm.getComponentAttributeNS(ns, name)).toBe(null);
    });
}

it('throws if no argument is passed', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.getComponentAttributeNS();
    }).toThrowError(TypeError);
});

it('throws if when missing the attribute name', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.getComponentAttributeNS(TEST_NS);
    }).toThrowError(TypeError);
});

testInvalidProperty('null', TEST_NS, null);
testInvalidProperty('undefined', TEST_NS, undefined);
testInvalidProperty('empty string', TEST_NS, '');
testInvalidProperty('number', TEST_NS, 1);

it('should return attribute on the host element', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttributeNS(TEST_NS, 'foo', 'bar');

    expect(elm.getComponentAttributeNS(TEST_NS, 'foo')).toBe('bar');
});
