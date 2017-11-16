import { Element } from 'engine';

export default class PrivateWiredNonapiProperty extends Element {
    // enable tests to trigger wire config changes driven by a non-public property
    @api set field(value) {
        this._field = value;
    }
    @api get field() {
        return this._field;
    }

    _field;

    @wire('test', { field: '$_field' })
    wiredField;

    get WiredName() {
        return this.wiredField.data ? this.wiredField.data.Name : '';
    }

    get WiredError() {
        return this.wiredField.error;
    }
}
