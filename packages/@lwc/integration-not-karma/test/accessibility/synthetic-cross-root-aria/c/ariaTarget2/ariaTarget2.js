import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api usePropertyAccess = false;

    @api
    setId(id) {
        if (this.usePropertyAccess) {
            this.refs.label.id = id;
        } else {
            this.refs.label.setAttribute('id', id);
        }
    }

    @api
    getId() {
        if (this.usePropertyAccess) {
            return this.refs.label.id;
        } else {
            return this.refs.label.getAttribute('id');
        }
    }
}
