import { LightningElement, api } from 'lwc';
import { ariaProperties } from 'test-utils';

export default class extends LightningElement {
    @api
    getAllAriaProps() {
        const result = {};
        for (const prop of ariaProperties) {
            result[prop] = this[prop];
        }
        return result;
    }

    @api
    setAllAriaProps(value) {
        for (const prop of ariaProperties) {
            this[prop] = value;
        }
    }

    @api
    callGetAttribute(attrName) {
        return this.getAttribute(attrName);
    }

    @api
    callPropertyGetter(propName) {
        return this[propName];
    }
}
