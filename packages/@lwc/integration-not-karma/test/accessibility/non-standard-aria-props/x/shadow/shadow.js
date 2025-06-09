import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    @api
    setProp(prop, val) {
        this[prop] = val;
    }

    @api
    getProp(prop) {
        return this[prop];
    }

    @api
    setPropOnElement(prop, val) {
        this.refs.elm[prop] = val;
    }

    @api
    getPropOnElement(prop) {
        return this.refs.elm[prop];
    }
}
