import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

class SetAttribute extends LightningElement {
    @api
    setComponentAttribute(...args) {
        return this.setAttribute(...args);
    }
}

function testConvertValueToString(type, value) {
    it(`should convert attribute value to string ${type}`, () => {
        const elm = createElement('x-set-attribute', { is: SetAttribute });
        elm.setComponentAttribute('foo', value);

        expect(elm.getAttribute('foo')).toBe(String(value));
    });
}

describe('LightningElement.setAttribute', () => {
    it('throws if name is not provided', () => {
        const elm = createElement('x-set-attribute', { is: SetAttribute });
        expect(() => {
            elm.setComponentAttribute();
        }).toThrowError(TypeError);
    });

    it('throws if value is not provided', () => {
        const elm = createElement('x-set-attribute', { is: SetAttribute });
        expect(() => {
            elm.setComponentAttribute('foo');
        }).toThrowError(TypeError);
    });

    it('should throw when invoking setAttribute in constructor', () => {
        class Test extends LightningElement {
            constructor() {
                super();
                this.setAttribute('foo', 'bar');
            }
        }

        expect(() => {
            createElement('x-test', { is: Test });
        }).toThrowError(
            Error,
            /Assert Violation: Failed to construct '<x-test>': The result must not have attributes\./
        );
    });

    it('should return undefined', () => {
        const elm = createElement('x-set-attribute', { is: SetAttribute });
        expect(elm.setComponentAttribute('foo', 'bar')).toBe(undefined);
    });

    testConvertValueToString('undefined', undefined);
    testConvertValueToString('null', null);
    testConvertValueToString('number', 1);
    testConvertValueToString('true', true);
    testConvertValueToString('false', false);
    testConvertValueToString('object', { foo: 'bar' });
});
