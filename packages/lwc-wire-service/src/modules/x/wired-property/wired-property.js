import { Element, api, wire } from 'engine';

export default class WiredProperty extends Element {
    @api propName;

    @wire('test', { propName: '$propName', fields: ['Name'] })
    wiredField;

    get WiredName() {
        return this.wiredField.data ? this.wiredField.data.Name : '';
    }

    get WiredError() {
        return this.wiredField.error;
    }
}
