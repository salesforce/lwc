import { createElement } from 'lwc';

import Test from 'x/test';
import ConstructorInvocation from 'x/constructorInvocation';

function testConvertValueToString(type, value) {
    it(`should convert attribute value to string ${type}`, () => {
        const elm = createElement('x-test', { is: Test });
        elm.setComponentAttribute('foo', value);

        expect(elm.getAttribute('foo')).toBe(String(value));
    });
}

it('should log an error when invoking setAttribute in constructor', () => {
    expect(() => {
        createElement('x-constructor-invocation', { is: ConstructorInvocation });
    }).toLogErrorDev(
        /Failed to construct '<x-constructor-invocation>': The result must not have attributes\./
    );
});

it('should return undefined', () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.setComponentAttribute('foo', 'bar')).toBeUndefined();
});

testConvertValueToString('undefined', undefined);

// IE11 doesn't convert null values to String when invoking setAttribute
// testConvertValueToString('null', null);

testConvertValueToString('number', 1);
testConvertValueToString('true', true);
testConvertValueToString('false', false);
testConvertValueToString('object', { foo: 'bar' });
