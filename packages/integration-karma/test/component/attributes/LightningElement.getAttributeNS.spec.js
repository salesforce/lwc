import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

class GetAttributeNS extends LightningElement {
    @api
    getComponentAttribute(...args) {
        return this.getAttributeNS(...args);
    }
}

function testInvalidProperty(type, name) {
    it(`should return null when passing an invalid attribute name ${type}`, () => {
        const elm = createElement('x-get-attribute', { is: GetAttributeNS });
        expect(elm.getComponentAttribute(name)).toBe(null);
    });
}

describe('LightningElement.getAttributeNS', () => {
    it('throws if no argument is passed', () => {
        const elm = createElement('x-get-attribute', { is: GetAttributeNS });
        expect(() => {
            elm.getComponentAttribute();
        }).toBe(null);
    });

    testInvalidProperty('null', null);
    testInvalidProperty('undefined', undefined);
    testInvalidProperty('empty string', '');
    testInvalidProperty('number', 1);

    it('should return attribute on the host element', () => {
        const elm = createElement('x-get-attribute', { is: GetAttributeNS });
        elm.setAttribute('foo', 'bar');

        expect(elm.getComponentAttribute('foo')).toBe('bar');
    });

    it('should normalize the attribute name to lowercase', () => {
        const elm = createElement('x-get-attribute', { is: GetAttributeNS });
        elm.setAttribute('foo', 'bar');

        expect(elm.getComponentAttribute('FOO')).toBe('bar');
    });
});
