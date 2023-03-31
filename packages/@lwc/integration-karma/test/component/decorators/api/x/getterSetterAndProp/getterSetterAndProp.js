import { LightningElement, api } from 'lwc';

function getDescriptor(obj, prop) {
    while (obj) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (descriptor) {
            return descriptor;
        }
        obj = Object.getPrototypeOf(obj);
    }
}

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
        const { get } = getDescriptor(this, prop);
        get.call({});
    }

    @api
    callSetterInternallyWithWrongThis(prop, val) {
        const { set } = getDescriptor(this, prop);
        set.call({}, val);
    }
}
