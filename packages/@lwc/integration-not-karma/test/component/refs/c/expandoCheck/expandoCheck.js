import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    checkAndSet() {
        if (!this.refs) {
            this.refs = 'foo';
        }
    }

    @api
    getRefs() {
        return this.refs;
    }
}
