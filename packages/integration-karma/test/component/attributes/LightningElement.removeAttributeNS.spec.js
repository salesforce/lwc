import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

const TEST_NS = 'http://www.salesforce.com/2019/lwc';

class RemoveAttributeNS extends LightningElement {
    @api
    removeComponentAttributeNS(...args) {
        return this.removeAttributeNS(...args);
    }
}

describe('LightningElement.removeAttributeNS', () => {
    it('throws an error if namespace is not provided', () => {
        const elm = createElement('x-remove-attribute-ns', { is: RemoveAttributeNS });
        expect(() => {
            elm.removeComponentAttributeNS();
        }).toThrowError(TypeError);
    });

    it('throws an error if name is not provided', () => {
        const elm = createElement('x-remove-attribute-ns', { is: RemoveAttributeNS });
        expect(() => {
            elm.removeComponentAttributeNS(TEST_NS);
        }).toThrowError(TypeError);
    });

    it('should not throw if the attribute is not present', () => {
        const elm = createElement('x-remove-attribute-ns', { is: RemoveAttributeNS });
        expect(() => {
            elm.removeComponentAttributeNS(TEST_NS, 'foo');
        }).not.toThrowError();
    });

    it('should return undefined', () => {
        const elm = createElement('x-remove-attribute-ns', { is: RemoveAttributeNS });
        expect(elm.removeComponentAttributeNS(TEST_NS, 'foo')).toBe(undefined);
    });

    it('should remove the attribute if present on the host element', () => {
        const elm = createElement('x-remove-attribute-ns', { is: RemoveAttributeNS });
        elm.setAttributeNS(TEST_NS, 'foo', 'bar');
        elm.removeComponentAttributeNS(TEST_NS, 'foo');

        expect(elm.hasAttributeNS(TEST_NS, 'foo')).toBe(false);
    });
});
