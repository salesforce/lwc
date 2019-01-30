import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

const TEST_NS = 'http://www.salesforce.com/2019/lwc';

class GetAttributeNS extends LightningElement {
    @api
    getComponentAttributeNS(...args) {
        return this.getAttributeNS(...args);
    }
}

function testInvalidProperty(type, ns, name) {
    it(`should return null when passing an invalid attribute name ${type}`, () => {
        const elm = createElement('x-get-attribute-ns', { is: GetAttributeNS });
        expect(elm.getComponentAttributeNS(ns, name)).toBe(null);
    });
}

describe('LightningElement.getAttributeNS', () => {
    it('throws if no argument is passed', () => {
        const elm = createElement('x-get-attribute-ns', { is: GetAttributeNS });
        expect(() => {
            elm.getComponentAttributeNS();
        }).toThrowError(TypeError);
    });

    it('throws if when missing the attribute name', () => {
        const elm = createElement('x-get-attribute-ns', { is: GetAttributeNS });
        expect(() => {
            elm.getComponentAttributeNS(TEST_NS);
        }).toThrowError(TypeError);
    });

    testInvalidProperty('null', TEST_NS, null);
    testInvalidProperty('undefined', TEST_NS, undefined);
    testInvalidProperty('empty string', TEST_NS, '');
    testInvalidProperty('number', TEST_NS, 1);

    it('should return attribute on the host element', () => {
        const elm = createElement('x-get-attribute-ns', { is: GetAttributeNS });
        elm.setAttributeNS(TEST_NS, 'foo', 'bar');

        expect(elm.getComponentAttributeNS(TEST_NS, 'foo')).toBe('bar');
    });
});
