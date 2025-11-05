import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    setRefs(value) {
        this.refs = value;
    }
    @api
    getRefs() {
        return this.refs;
    }
    @api
    deleteRefs() {
        delete this.refs;
    }
}
