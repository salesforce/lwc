import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    setProperty(propName, propValue) {
        this[propName] = propValue;
    }

    @api
    getProperty(propName) {
        return this[propName];
    }
}
