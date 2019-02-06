import { createElement } from 'test-utils';

import Test from 'x/test';
import ConstructorInvocation from 'x/constructorInvocation';

const TEST_NS = 'http://www.salesforce.com/2019/lwc';

it('throws if namespace is not provided', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.setComponentAttributeNS();
    }).toThrowError(TypeError);
});

it('throws if name is not provided', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.setComponentAttributeNS(TEST_NS);
    }).toThrowError(TypeError);
});

it('throws if value is not provided', () => {
    const elm = createElement('x-test', { is: Test });
    expect(() => {
        elm.setComponentAttributeNS(TEST_NS, 'foo');
    }).toThrowError(TypeError);
});

it('should throw when invoking setAttributeNS in constructor', () => {
    expect(() => {
        createElement('x-constructor-invocation', { is: ConstructorInvocation });
    }).toThrowError(
        Error,
        /Assert Violation: Failed to construct '<x-constructor-invocation>': The result must not have attributes\./
    );
});

it('should return undefined', () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.setComponentAttributeNS(TEST_NS, 'foo', 'bar')).toBe(undefined);
});

function testConvertValueToString(type, value) {
    it(`should convert attribute value to string ${type}`, () => {
        const elm = createElement('x-test', { is: Test });
        elm.setComponentAttributeNS(TEST_NS, 'foo', value);

        expect(elm.getAttributeNS(TEST_NS, 'foo')).toBe(String(value));
    });
}

testConvertValueToString('undefined', undefined);
testConvertValueToString('null', null);
testConvertValueToString('number', 1);
testConvertValueToString('true', true);
testConvertValueToString('false', false);
testConvertValueToString('object', { foo: 'bar' });
