import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

const TEST_NS = 'http://www.salesforce.com/2019/lwc';

class SetAttributeNS extends LightningElement {
    @api
    setComponentAttributeNS(...args) {
        return this.setAttributeNS(...args);
    }
}

function testConvertValueToString(type, value) {
    it(`should convert attribute value to string ${type}`, () => {
        const elm = createElement('x-set-attribute-ns', { is: SetAttributeNS });
        elm.setComponentAttributeNS(TEST_NS, 'foo', value);

        expect(elm.getAttributeNS(TEST_NS, 'foo')).toBe(String(value));
    });
}

describe('LightningElement.setAttributeNS', () => {
    it('throws if namespace is not provided', () => {
        const elm = createElement('x-set-attribute-ns', { is: SetAttributeNS });
        expect(() => {
            elm.setComponentAttributeNS();
        }).toThrowError(TypeError);
    });

    it('throws if name is not provided', () => {
        const elm = createElement('x-set-attribute-ns', { is: SetAttributeNS });
        expect(() => {
            elm.setComponentAttributeNS(TEST_NS);
        }).toThrowError(TypeError);
    });

    it('throws if value is not provided', () => {
        const elm = createElement('x-set-attribute-ns', { is: SetAttributeNS });
        expect(() => {
            elm.setComponentAttributeNS(TEST_NS, 'foo');
        }).toThrowError(TypeError);
    });

    it('should throw when invoking setAttributeNS in constructor', () => {
        class Test extends LightningElement {
            constructor() {
                super();
                this.setAttributeNS('foo', 'bar');
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
        const elm = createElement('x-set-attribute-ns', { is: SetAttributeNS });
        expect(elm.setComponentAttributeNS(TEST_NS, 'foo', 'bar')).toBe(undefined);
    });

    testConvertValueToString('undefined', undefined);
    testConvertValueToString('null', null);
    testConvertValueToString('number', 1);
    testConvertValueToString('true', true);
    testConvertValueToString('false', false);
    testConvertValueToString('object', { foo: 'bar' });
});
