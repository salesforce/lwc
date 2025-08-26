import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    thisValueIsAlwaysFalse = false;

    @api
    getRefs() {
        return this.refs;
    }
}
