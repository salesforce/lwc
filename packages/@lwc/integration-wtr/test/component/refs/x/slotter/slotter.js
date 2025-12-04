import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api getRefs() {
        return this.refs;
    }
}
