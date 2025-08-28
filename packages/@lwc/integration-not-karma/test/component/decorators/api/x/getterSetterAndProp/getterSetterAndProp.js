import { LightningElement, api } from 'lwc';
import { getPropertyDescriptor } from '../../../../../../helpers/utils.js';

export default class GetterSetter extends LightningElement {
    _getterSetterProp;

    @api
    get getterSetterProp() {
        return this._getterSetterProp;
    }
    set getterSetterProp(value) {
        this._getterSetterProp = value;
    }

    @api
    classProp;

    @api
    callGetterInternallyWithWrongThis(prop) {
        const { get } = getPropertyDescriptor(this, prop);
        get.call({});
    }

    @api
    callSetterInternallyWithWrongThis(prop, val) {
        const { set } = getPropertyDescriptor(this, prop);
        set.call({}, val);
    }
}
