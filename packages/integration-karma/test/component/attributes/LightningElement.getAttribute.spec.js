import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

class GetAttribute extends LightningElement {
    @api
    getComponentAttribute(...args) {
        return this.getAttribute(...args);
    }
}

function testInvalidProperty(type, name) {
    it(`should return null when passing an invalid attribute name ${type}`, () => {
        const elm = createElement('x-get-attribute', { is: GetAttribute });
        expect(elm.getComponentAttribute(name)).toBe(null);
    });
}

describe('LightningElement.getAttribute', () => {
    testInvalidProperty('null', null);
    testInvalidProperty('undefined', undefined);
    testInvalidProperty('empty string', '');
    testInvalidProperty('number', 1);

    it('should return attribute on the host element', () => {
        const elm = createElement('x-get-attribute', { is: GetAttribute });
        elm.setAttribute('foo', 'bar');

        expect(elm.getComponentAttribute('foo')).toBe('bar');
    });

    it('should normalize the attribute name to lowercase', () => {
        const elm = createElement('x-get-attribute', { is: GetAttribute });
        elm.setAttribute('foo', 'bar');

        expect(elm.getComponentAttribute('FOO')).toBe('bar');
    });
});
