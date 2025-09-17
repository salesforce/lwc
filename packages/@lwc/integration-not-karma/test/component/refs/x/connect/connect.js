import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api result = 'initial value';

    connectedCallback() {
        this.result = this.refs;
    }
}
