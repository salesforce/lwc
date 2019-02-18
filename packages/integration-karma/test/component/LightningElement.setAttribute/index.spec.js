import { createElement } from 'test-utils';

import Test from 'x/test';
import ConstructorInvocation from 'x/constructorInvocation';

function testConvertValueToString(type, value) {
    it(`should convert attribute value to string ${type}`, () => {
        const elm = createElement('x-test', { is: Test });
        elm.setComponentAttribute('foo', value);

        expect(elm.getAttribute('foo')).toBe(String(value));
    });
}

it('should throw when invoking setAttribute in constructor', () => {
    expect(() => {
        createElement('x-constructor-invocation', { is: ConstructorInvocation });
    }).toThrowError(
        Error,
        /Assert Violation: Failed to construct '<x-constructor-invocation>': The result must not have attributes\./,
    );
});

it('should return undefined', () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.setComponentAttribute('foo', 'bar')).toBe(undefined);
});

testConvertValueToString('undefined', undefined);

// IE11 doesn't convert null values to String when invoking setAttribute
// testConvertValueToString('null', null);

testConvertValueToString('number', 1);
testConvertValueToString('true', true);
testConvertValueToString('false', false);
testConvertValueToString('object', { foo: 'bar' });
