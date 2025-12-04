import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api result;

    disconnectedCallback() {
        this.result = this.refs.foo.textContent;
    }
}
